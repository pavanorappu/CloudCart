pipeline {
    agent any

    environment {
        IMAGE_NAME = "pavanorappu/cloudcart-backend"
        IMAGE_TAG = "${BUILD_NUMBER}"
        KUBECONFIG = "/var/lib/jenkins/.kube/config"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                docker build \
                -t ${IMAGE_NAME}:${IMAGE_TAG} \
                -t ${IMAGE_NAME}:latest \
                ./app/backend
                '''
            }
        }

        stage('Docker Hub Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                sh '''
                docker push ${IMAGE_NAME}:${IMAGE_TAG}

                docker push ${IMAGE_NAME}:latest
                '''
            }
        }

        stage('Pull Latest Image') {
            steps {
                sh '''
                docker pull ${IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }

        stage('Load Image into Minikube') {
            steps {
                sh '''
                minikube image load ${IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }

        stage('Update Kubernetes Deployment') {
            steps {
                sh '''
                kubectl set image deployment/cloudcart-backend \
                backend=${IMAGE_NAME}:${IMAGE_TAG}

                kubectl rollout restart deployment/cloudcart-backend
                '''
            }
        }

        stage('Wait For Rollout') {
            steps {
                sh '''
                kubectl rollout status deployment/cloudcart-backend
                '''
            }
        }

        stage('Verify Pods') {
            steps {
                sh '''
                kubectl get pods
                kubectl get svc
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                URL=$(minikube service cloudcart-backend-service --url)
                curl ${URL}/health
                '''
            }
        }
    }

    post {

        success {
            echo '=========================================='
            echo ' CloudCart Deployment Successful'
            echo ' Docker Image Built & Pushed'
            echo ' Kubernetes Updated Successfully'
            echo '=========================================='
        }

        failure {
            echo '=========================================='
            echo ' Deployment Failed'
            echo '=========================================='

            sh '''
            kubectl get pods
            kubectl describe deployment cloudcart-backend
            kubectl get events --sort-by=.lastTimestamp | tail -20
            '''
        }
    }
}
