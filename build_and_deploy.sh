cd LeakLenseDocs
npm run build
cp -r build/* ../docs/
cd ..
git add . 
git commit -m "Updated docs via script"
git push