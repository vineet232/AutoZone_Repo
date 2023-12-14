#!/bin/bash


context_path=../;
docker_repo="vineet2302/custom_images";

image_name="autozone-nginx-image";
image_path=`echo $docker_repo":"$image_name`;
container_name="application-server";


port="80:80";
dockerfile_path="../Dockerfile-autozone";


#echo $port;
echo "Image: $image_path";

echo "Creating docker image.....";
docker build --no-cache -t $image_path -f $dockerfile_path $context_path;


echo "List of docker images in system:";

#start-sleep(1);
docker image ls


#echo "Running container using docker image: $image_path";
#docker run -d -p $port --name $container_name $image_path;


#echo "List of running containers";
#docker ps;

docker push $image_path
#docker push $backend_image_path
