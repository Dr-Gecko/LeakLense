import time
import argon2
import datetime
import traceback
from uuid import uuid4
from base64 import b64encode
import functions.utils as utils
from argon2 import PasswordHasher
import functions.database as database
from fastapi import Response, status,Request
import mysql.connector.errors as msqlerrors

auth_role_layout={
    "owner":10,
    "admin":9,
    "dev":8,
    "trusted_user":7,
    "user":0
}
async def create_user(request:Request):
    try:
        json_data = await request.json()
        username=json_data['username']
        password=json_data['password']
        request_ip = request.headers.get("X-Forwarded-For") or request.client.host
        ph=PasswordHasher()
        password_hash=ph.hash(password)
        insert_sql = """INSERT INTO users (username, hash, role, rbac_id, user_avatar_path, last_login_ip) VALUES (%s, %s, %s, %s, %s, %s);"""
        params = (username, password_hash, "user", 0, "/dist/img/default.png",request_ip)
        rows_affected = await database.execute(insert_sql, params)
        if rows_affected==1:
            return utils.format_response({"message":f"created user {username}"})
        else:
            return utils.format_response({"response":"failed to create user"},status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,reason="failed")
    except msqlerrors.IntegrityError as error:
        if error.errno == 1062:
            return utils.format_response({"response": "username already exists"},status_code=status.HTTP_409_CONFLICT,reason="failed")
    except Exception as error:
        utils.format_response({"response":"failed to create user"},status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,reason="failed")

async def login_user(request:Request):
    try:
        json_data = await request.json()
        ip = request.headers.get("X-Forwarded-For") or request.client.host
        username=json_data['username']
        password=json_data['password']
        ph=PasswordHasher()
        sql_statement = "SELECT hash FROM users WHERE username = %s"
        parameters = (username,)
        user_data = await database.fetch_one(sql_statement, parameters)
        password_hash=user_data.get("hash")
        if ph.verify(password_hash,password):
            auth_token=b64encode(bytes(str(uuid4()),'utf-8')).decode('utf-8')
            expiry_dt = datetime.datetime.now() + datetime.timedelta(hours=1)
            exp_time = expiry_dt.strftime('%Y-%m-%d %H:%M:%S') 
            statement="UPDATE users SET auth_token = %s, last_login_ip = %s, auth_token_expire = %s WHERE username  = %s;"
            params=(auth_token,ip,exp_time,username)
            affected_rows=await database.execute(statement,params)    
            if affected_rows > 0:
                pull_user_info_sql="SELECT user_id,username,role as user_role, user_avatar_path as avatar FROM users WHERE username = %s;"
                params=(username,)
                data=await database.fetch_one(pull_user_info_sql,params)
                
                
                return utils.format_response(reason="logged in successfully",data={"token":auth_token,"expire_time":exp_time,"user_data":data})
            else:
                return utils.format_response({"response":"internal error"},status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,reason="failed")
    except argon2.exceptions.VerifyMismatchError as error:
        return utils.format_response({"response":"incorrect username or password"},status_code=status.HTTP_401_UNAUTHORIZED,reason="failed")
    except AttributeError:
        return utils.format_response({"response":"incorrect username or password"},status_code=status.HTTP_401_UNAUTHORIZED,reason="failed")
    except Exception as error:
        print(error)
        return utils.format_response({"response":f"failed to login user {error}"},status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,reason="failed")

async def verify_auth_get_role(auth_token):
    try:
        sql_statement = "SELECT auth_token_expire,username,role FROM users WHERE auth_token = %s;"
        params=(auth_token,)
        data=await database.fetch_one(sql_statement,params)
        auth_token_expire=data['auth_token_expire']
        username=data['username']
        role=data['role']
        if auth_token_expire.timestamp()>=time.time():
            return True,username,role
        else:
            return False,utils.format_response({"response":"API key expired"},status_code=status.HTTP_401_UNAUTHORIZED,reason="failed")
    except TypeError:
        return False,utils.format_response({"response":"API key invalid"},status_code=status.HTTP_401_UNAUTHORIZED,reason="failed")
    except Exception as error:
        return False,utils.format_response({"response":"failed"},status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,reason="failed")

async def update_user(auth_token,request:Request):
    try:
        required_role=auth_role_layout["owner"]
        json_data=await request.json()
        user=json_data['user']
        column=json_data['column']
        data=json_data['data']
        verifed=await verify_auth_get_role(auth_token)
        if verifed[0]!=True:
            return False,utils.format_response({"response":"API key invalid"},status_code=status.HTTP_401_UNAUTHORIZED,reason="failed")
        if auth_role_layout[verifed[2]]<required_role:
            return False,utils.format_response({"response":"invalid permissions"},status_code=status.HTTP_401_UNAUTHORIZED,reason="failed")
        sql_statement=f"UPDATE users SET {column} = %s WHERE username  = %s;"
        params=(data,user)
        affected_rows=await database.execute(sql_statement,params)
        if affected_rows > 0:
            return utils.format_response({"response":f"successfully updated colum: {column} for user: {user}"})
        else:
            return utils.format_response({"response":"internal error"},status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,reason="failed")
    except TypeError:
        return False,utils.format_response({"response":"API key invalid"},status_code=status.HTTP_401_UNAUTHORIZED,reason="failed")
    except Exception as error:
        return False,utils.format_response({"response":"failed"},status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,reason="failed")

async def get_all_users(auth_token):
    try:
        all_users=[]
        required_role=auth_role_layout["owner"]
        verifed=await verify_auth_get_role(auth_token)
        if verifed[0]!=True:
            return False,utils.format_response({"response":"API key invalid"},status_code=status.HTTP_401_UNAUTHORIZED,reason="failed")
        if auth_role_layout[verifed[2]]<required_role:
            return False,utils.format_response({"response":"invalid permissions"},status_code=status.HTTP_401_UNAUTHORIZED,reason="failed")
        sql_statement=f"SELECT username, last_login_time, last_login_ip, auth_token_expire, role FROM users"
        users=await database.fetch_all(sql_statement)
        for user in users:
            last_login = user.get('last_login_time')
            expire = user.get('auth_token_expire')
            json_data = {
                'username': user.get('username') or 'N/A',
                'last_login_time': last_login.strftime("%Y-%m-%d %H:%M:%S") if last_login else 'N/A',
                'last_login_ip': user.get('last_login_ip') or 'N/A',
                'auth_token_expire': expire.strftime("%Y-%m-%d %H:%M:%S") if expire else 'N/A',
                'role': user.get('role') or 'N/A'
                }
            all_users.append(json_data)
        return utils.format_response(all_users)
    except TypeError:
        print(traceback.print_exc())
        return False,utils.format_response({"response":"API key invalid"},status_code=status.HTTP_401_UNAUTHORIZED,reason="failed")
    except Exception as error:
        return False,utils.format_response({"response":"failed"},status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,reason="failed")



async def delete_user(auth_token,request:Request):
    try:
        required_role=auth_role_layout["owner"]
        json_data=await request.json()
        user=json_data['user']
        verifed=await verify_auth_get_role(auth_token)
        if verifed[0]!=True:
            return False,utils.format_response({"response":"API key invalid"},status_code=status.HTTP_401_UNAUTHORIZED,reason="failed")
        if auth_role_layout[verifed[2]]<required_role:
            return False,utils.format_response({"response":"invalid permissions"},status_code=status.HTTP_401_UNAUTHORIZED,reason="failed")
        sql_statement=f"DELETE FROM users WHERE username = %s;"
        params=(user,)
        affected_rows=await database.execute(sql_statement,params)
        if affected_rows > 0:
            return utils.format_response({"response":f"deleted {user}"})
        else:
            return utils.format_response({"response":"internal error"},status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,reason="failed")
    except TypeError:
        return False,utils.format_response({"response":"API key invalid"},status_code=status.HTTP_401_UNAUTHORIZED,reason="failed")
    except Exception as error:
        return False,utils.format_response({"response":"failed"},status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,reason="failed")
