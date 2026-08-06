pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = "pavanorappu"
        IMAGE_NAME = "cloudcart-backend"
        IMAGE = "${DOCKERHUB_USERNAME}/${IMAGE_NAME}"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                docker build \
                -t ${IMAGE}:${IMAGE_TAG} \
                -t ${IMAGE}:latest \
                ./app/backend
                """
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'USERNAME',
                    passwordVariable: 'PASSWORD'
                )]) {
                    sh '''
                    echo $PASSWORD | docker login -u $USERNAME --password-stdin
                    '''
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                sh """
                docker push ${IMAGE}:${IMAGE_TAG}
                docker push ${IMAGE}:latest
                """
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                kubectl rollout restart deployment/cloudcart-backend
                kubectl rollout status deployment/cloudcart-backend
                '''
            }
        }

        stage('Verify Deployment') {
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
            echo "==================================="
            echo " Production Deployment Successful"
            echo "==================================="
        }

        failure {
            echo "==================================="
            echo " Deployment Failed"
            echo "==================================="

            sh '''
            kubectl get pods
            kubectl describe deployment cloudcart-backend
            '''
        }
    }
}
