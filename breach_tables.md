---
title: LeakLense SQL table breakdown
layout: home
---

# Table descriptions for the backend SQL 

## Breaches database:

### Table Name: Breaches

|Column Name|Type|Null|Notes|
|---|---|---|---|
|id|INT|N|Auto increment ID for each breach added to LeakLense|
|name|VARCHAR(255)|N|Name of the breach|
|threat_actor|TEXT|N|Threat actor attributed to breach|
|date_added|TIMESTAMP|N|Date breach added to LeakLense|
|record_count|INT|Y|Count of entries in breach|
|added_by|VARCHAR(255)|Y|User who added breach|

### Table Name: < breach_name >

Each breach you add gets a table

|Column Name|Type|Null|Notes|
|---|---|---|---|
|id|int||auto increment ID for each user in breach|
|name|VARCHAR(255)||name of the user in breach|
|address|text||Address of user if applicable|
|email|text||Email address of user if applicable|
|phone|text||Phone number of user if applicable|
|extra|longtext||Any extra data in a json format|
