pipeline {
    agent any

    environment {
        IMAGE_NAME = "cloudcart-backend"
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
            echo '======================================='
            echo ' Kubernetes Deployment Successful'
            echo '======================================='
        }

        failure {
            echo '======================================='
            echo ' Deployment Failed'
            echo '======================================='

            sh '''
            kubectl get pods
            kubectl describe deployment cloudcart-backend
            '''
        }
    }
}
