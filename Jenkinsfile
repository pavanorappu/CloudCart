pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = "pavanorappu"
        IMAGE_NAME = "cloudcart-backend"
        IMAGE = "${DOCKERHUB_USERNAME}/${IMAGE_NAME}"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    tools {
        sonarQubeScanner 'SonarScanner'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        sonar-scanner
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
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
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'USERNAME',
                        passwordVariable: 'PASSWORD'
                    )
                ]) {
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
                kubectl get pods
                kubectl get svc
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                kubectl port-forward svc/cloudcart-backend-service 8081:5000 >/tmp/pf.log 2>&1 &
                PF_PID=$!

                sleep 10

                curl http://localhost:8081/health

                kill $PF_PID || true
                '''
            }
        }
    }

    post {

        success {
            echo "===================================="
            echo " CloudCart Deployment Successful"
            echo "===================================="
        }

        failure {
            echo "===================================="
            echo " CloudCart Deployment Failed"
            echo "===================================="

            sh '''
            kubectl get pods
            kubectl describe deployment cloudcart-backend || true
            kubectl logs deployment/cloudcart-backend || true
            '''
        }

        always {
            cleanWs()
        }
    }
}
