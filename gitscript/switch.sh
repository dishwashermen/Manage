#! /bin/bash

cd /C/Users/user/Documents/GIT/HOT/Manage

echo

git status

echo

read -n 1 -r -p "Press D/P/C to switch/catchup branch "

echo

if [[ ! $REPLY =~ ^[DdPpCc]$ ]]

then

    exit 1
	
fi

if [[ $REPLY =~ ^[Dd]$ ]]

then

	branchname="Develop"
	
	git checkout "$branchname"
	
fi

if [[ $REPLY =~ ^[Pp]$ ]]

then

	branchname="Production"
	
	git checkout "$branchname"
	
fi

if [[ $REPLY =~ ^[Cc]$ ]]

then

	git ftp -s manage-dev catchup
	
fi

echo
	
read -n 1 -s -r -p "Branch checkout, press any key to continue"

exit 1

#git ftp -s dev catchup