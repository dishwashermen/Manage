#! /bin/bash

cd /C/Users/user/Documents/GIT/HOT/Manage

echo

git status

echo

read -n 1 -r -p "DEVELOP commit. Continue? " 

echo

if [[ ! $REPLY =~ ^[Cc]$ ]]

then

    exit 1
	
fi

if [[ $REPLY =~ ^[Cc]$ ]]

then

	read -p 'Commit name: ' commitname
	
	echo

	git add .
	
	echo

    git commit -m "$commitname"
	
	echo
	
	git push origin HEAD
	
	echo
	
	read -n 1 -s -r -p "Commit $commitname complete, press U key to upload"
	
	if [[ ! $REPLY =~ ^[Uu]$ ]]

	then

		exit 1
		
	fi
	
	echo
	
	git ftp -s manage-dev push
	
	echo
	
	read -n 1 -s -r -p "Upload complete, press any key to continue"
	
fi

exit 1

#git ftp -s manage-dev catchup