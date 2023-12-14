#!/bin/bash

container_name="application-server";
image_path="vineet2302/custom_images:autozone-nginx-image";


echo "List of running docker containers:";
docker ps;

echo "Stopping and deleting contaier $container_name:";
docker stop $container_name;
docker rm $container_name;

echo "Updated list of running docker containers:";
docker ps;



echo "List of existing docker images:";

docker image ls;

echo "Deleting image $image_path:";
docker rmi $image_path;


echo "Updated list of existing docker images:";
docker image ls;

docker image prune -f;

echo "Finished!!!";
