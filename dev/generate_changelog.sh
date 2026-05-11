modifiedFiles=$(git diff --name-status)
build_hash=$(find ./ -type f -print0 | sort -z | xargs -0 md5sum | md5sum)
new_untracked_files=$(git ls-files --others --exclude-standard)
date_format=$(date '+%Y-%m-%d')
echo "$modifiedFiles"
echo "$build_hash"
echo "$new_untracked_files"
echo "$date_format"