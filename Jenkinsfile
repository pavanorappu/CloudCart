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

        stage('SonarQube Code Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'

                    withSonarQubeEnv('SonarQube') {
                        sh """
                            ${scannerHome}/bin/sonar-scanner
                        """
                    }
                }
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
                    kubectl rollout status deployment/cloudcart-backend --timeout=180s
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    echo "===== Pods ====="
                    kubectl get pods -o wide

                    echo ""
                    echo "===== Services ====="
                    kubectl get svc

                    echo ""
                    echo "===== Deployment ====="
                    kubectl get deployment
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    echo "Waiting for Pods to become Ready..."

                    kubectl wait \
                        --for=condition=ready \
                        pod \
                        -l app=cloudcart-backend \
                        --timeout=180s

                    MINIKUBE_IP=$(minikube ip)

                    NODE_PORT=$(kubectl get svc cloudcart-backend-service \
                        -o jsonpath='{.spec.ports[0].nodePort}')

                    echo "Minikube IP: ${MINIKUBE_IP}"
                    echo "NodePort: ${NODE_PORT}"

                    echo "Checking Health Endpoint..."

                    curl --fail \
                        http://${MINIKUBE_IP}:${NODE_PORT}/health

                    echo ""
                    echo "Application is Healthy."
                '''
            }
        }
    }

    post {

        always {
            sh '''
                docker logout || true
            '''
        }

        success {
            echo "==================================="
            echo " CloudCart Deployment Successful"
            echo "==================================="
        }

        failure {
            echo "==================================="
            echo " CloudCart Deployment Failed"
            echo "==================================="

            sh '''
                kubectl get pods || true
                kubectl get svc || true
                kubectl describe deployment cloudcart-backend || true
            '''
        }
    }
}
