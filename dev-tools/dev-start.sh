#!/bin/bash
echo "Dev Start"
pwdLocStart=$(pwd)
echo $pwdLocStart

cd ../services/practice-tool-ms
pwdLocService=$(pwd)
pwdLocServiceLog=$pwdLocStart/logs/practice-tool-ms.log
echo $pwdLocService
echo $pwdLocServiceLog


npm start > $pwdLocServiceLog