###########################################################################################################################
Author: Vineet Kumar
Email Id: vineetkumar2302@outlook.com
Description: This files contains step by step guide to deploy run the "mywebapp" application. 
Note: The application has been tested in minikube environment running 3 nodes. 1 control node and 2 worker nodes.		
###########################################################################################################################

> The environment used here is minikube which is running on a Windows Hyper-V based Ubuntu Linux VM.

Step 1: Configure the minikube environment.
	> Install minikube in ubuntu VM.
	> Create a multi-node kubernetes cluster named "k8s-cluster" execute the following command:		
		=> minikube start --nodes 3 -p k8s-cluster 
			#.......k8s-cluster is the name of kubernetes cluster and 3 is the number of nodes in it.
			#.......Here I have taken 3 nodes for representation purpose. 
			#.......Number of nodes can be increased or decreased based on our requirement and resource availability on host VM.
	
	> Execute following command to create a Alias for "minikube kubectl --":
		=> alias kubectl="minikube kubectl --"
			#.......By creating this Alias we can freely use kubectl command instead of typing "minikube kubectl --"
			#.......The alias command mentioned above can be added to .bashrc file present in user's profile to make the changes permanent.
	
	> Label the nodes based on their roles. Execute the below command for labeling:
		=> kubectl label node <node_name> node-role.kubernetes.io/worker=worker
			#.......Make sure all the worker nodes are labeled since these lables will be used in pod deployment.
			#.......Labeling only worker nodes is sufficient for running the application smoothly.
	
	> Execute the following command to enable the required minikube addons:
		=> minikube addons enable metrics-server 	 .
		=> minikube addons enable storage-provisioner
			#.......Check if the enabled addons are visible with a green checkbox by executing "minikube addons list".

	> Execute "kubectl get nodes" command to check if all the nodes are visible with their label.
			#.......Below is the sample output of "kubectl get nodes" command:

			NAME              STATUS   ROLES           AGE     VERSION
			k8s-cluster       Ready    control-plane   7d16h   v1.28.3
			k8s-cluster-m02   Ready    worker          14h     v1.28.3
			k8s-cluster-m03   Ready    worker          14h     v1.28.3

	> Execute "minikube tunnel" in a separate terminal and leave the terminal in running state.
			#.......The above mentioned tunnel will help in getting External IP address for our web-application.


Step 2: Clone git repository consisting the tasks/application related files.
	> Create a new directory in your host VM executing "mkdir <directory-name>" for example: "mkdir git-repos"
	> Execute the following commands:
		=> cd git-repos
		=> git clone https://github.com/vineet232/AutoZone_Repo
		=> git pull

	> Verify if all the files are visible in AutoZone_Repo directory/repository cloned in host VM.
		=> Following directories should be visible inside AutoZone_Repo directory.
			user@hostname:~/git-repos$ ls -l AutoZone_Repo/
			total 8
			drwxrwxr-x 4 vineet vineet 4096 Dec 14 15:52 gcp-cloud-run-task
			drwxrwxr-x 3 vineet vineet 4096 Dec 14 15:47 k8s-tasks
			
	> Go to "mywebapp" directory inside k8s-tasks:
		=> Execute "cd k8s-tasks/mywebapp" 

Step 3: Build application image and upload on dockerhub:
	> Check the "Dockerfile-autozone" file inside "mywebapp" directory. 
		=> Execute cat Dockerfile-autozone
			#.........Dockerfile-autozone will build a nginx and flask based web application image.
			#.........Image will be uploaded to my dockerhub public repository.
			#.........Image path on dockerhub is: vineet2302/custom_images:autozone-nginx-image
 
	> Go to directory: mywebapp/scripts/
	 	=> Execute "cd mywebapp/scripts"
		=> Execute "sudo ./run.sh"
			#.........The script run.sh will build and upload the image on dockerhub automatically.
		=> The image build/upload process may fail due to permission related issue. Hence, execute the script as super user or root.
		=> Incase of failure execute "sudo ./cleanup.sh" 2-3 times to make sure that there are no local docker images present in the system.
		=> Post cleanup (if required), execute "sudo ./run.sh" again to retry the build and upload.

	> Once the image is successfully pushed to Dockerhub proceed with Step 4.

Step 4: Deploy the application using the dockerhub image uploaded in Step3:
	> Go to the directory "mywebapp/k8s-yaml-files".
		#.........This directory contains all the necessary kubernetes manifest files.
	
	> Execute following commands in sequence:
		=> kubectl apply -f mywebapp-pv.yaml		-----> Create Persistent Volume
		=> kubectl apply -f mywebapp-pvc.yaml		-----> Create Persistent Volume Claim
		=> kubectl apply -f loadbalancer.yaml		-----> Create a Loadbalancer service for
		=> kubectl apply -f hpa.yaml			-----> Create HorizontalPodAutoscaling deployment
		=> kubectl apply -f deployment.yaml		-----> Create mywebapp-deployment
	
	> Verify if all the services are up and running. Execute following commands to verify: 
		=> kubectl get pv	
		=> kubectl get pvc
		=> kubectl get service
		=> kubectl get hpa
		=> kubectl get pods
		
		#...........Following output will be observed.	
		kubectl get pv
		==============
		NAME          CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                  STORAGECLASS   REASON   AGE
		mywebapp-pv   1Gi        RWX            Retain           Bound    default/mywebapp-pvc                           5m
		
		kubectl get pvc
		===============
		NAME           STATUS   VOLUME        CAPACITY   ACCESS MODES   STORAGECLASS   AGE
		mywebapp-pvc   Bound    mywebapp-pv   1Gi        RWX                           5m
		
		#.........Make sure that mywebapp-pvc is bound to mywebapp-pv only.

		kubectl get service
		===================
		NAME             TYPE           CLUSTER-IP       EXTERNAL-IP      PORT(S)                      AGE
		kubernetes       ClusterIP      10.96.0.1        <none>           443/TCP                      18h
		webapp-service   LoadBalancer   10.103.123.255   10.103.123.255   80:30859/TCP,443:30907/TCP   8h			
		
		#.........In minikube environment, EXTERNAL-IP will be visible after executing "minikube tunnel" command as mentioned in Step 1.	


		kubectl get hpa
		===============
		NAME         REFERENCE                      TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
		webapp-hpa   Deployment/webapp-deployment   2m/50m    1         10        1          1h
		
		kubectl get pods
		================
		NAME                                 READY   STATUS    RESTARTS   AGE
		webapp-deployment-5f8c8c4b6d-dwncf   1/1     Running   0          13m
		
		kubectl get deployments
		=======================
		NAME                READY   UP-TO-DATE   AVAILABLE   AGE
		webapp-deployment   1/1     1            1           25m

Step 5: Run the application.
	> The application can be tested both in web browser as well as using curl command. 
		#....... http URL : http://10.103.123.255
		#....... https URL: https://10.103.123.255
	> Use the above URLs in web browser to test the application using http or https.
	
	> For doing it via CLI, execute the following commands:
		=> curl -k http://10.103.123.255	-------> For HTTP test via CLI.
		=> curl -k https://10.103.123.255	-------> For HTTPS test via CLI.

##############.... Instead of "10.103.123.255" please use EXTERNAL-IP allocated to webapp-service visible in "kubectl get service" output. 
	

Step 6: Test the download using curl by executing following commands:
	> Execute following commands:
		=> curl -kO http://10.103.123.255/api/download_image/<uploaded-image-name>
		=> curl -O https://10.103.123.255/api/download_image/<uploaded-image-name>
##############.... Instead of "10.103.123.255" please use EXTERNAL-IP allocated to webapp-service visible in "kubectl get service" output.

	> Restart or delete the pod and execute the above commands after new pod is available to test the working of Persistent Volumes.
	> HPA can be tested by running any loadgenerator script.
	> Pods will autoscale and get distributed evenly among all the nodes.	
	

 











 	
