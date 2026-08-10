pipeline {

    agent any

    environment {

        // ============================================================
        // Docker Hub
        // ============================================================
        DOCKERHUB_REPO = "pavanorappu/cloudcart-backend"
        IMAGE_TAG = "${BUILD_NUMBER}"

        // ============================================================
        // Kubernetes
        // ============================================================
        K8S_DEPLOYMENT = "cloudcart-backend"
        K8S_CONTAINER = "backend"
        K8S_SERVICE = "cloudcart-backend-service"

        // ============================================================
        // Trivy
        // ============================================================
        TRIVY_IMAGE = "pavanorappu/cloudcart-backend:${BUILD_NUMBER}"

        // ============================================================
        // SonarQube
        // ============================================================
        SONAR_PROJECT_KEY = "CloudCart"
        SONAR_PROJECT_NAME = "CloudCart"
    }


    stages {

        // ============================================================
        // 1. CHECKOUT
        // ============================================================
        stage('Checkout') {

            steps {

                echo "Checking out CloudCart source code..."

                checkout scm

                sh '''
                    echo "========================================"
                    echo "Current Branch"
                    echo "========================================"

                    git branch --show-current

                    echo "========================================"
                    echo "Latest Commit"
                    echo "========================================"

                    git log -1 --oneline
                '''
            }
        }


        // ============================================================
        // 2. VERIFY TOOLS
        // ============================================================
        stage('Verify Tools') {

            steps {

                sh '''
                    echo "========================================"
                    echo "Docker"
                    echo "========================================"

                    docker --version
                    docker info > /dev/null


                    echo "========================================"
                    echo "Kubectl"
                    echo "========================================"

                    kubectl version --client


                    echo "========================================"
                    echo "Trivy"
                    echo "========================================"

                    trivy --version
                '''
            }
        }


        // ============================================================
        // 3. SONARQUBE CODE ANALYSIS
        // ============================================================
        stage('SonarQube Analysis') {

            steps {

                echo "Running SonarQube static code analysis..."

                withSonarQubeEnv('SonarQube') {

                    script {

                        def scannerHome = tool 'SonarScanner'

                        sh """
                            echo "========================================"
                            echo "SonarScanner"
                            echo "========================================"

                            ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                                -Dsonar.projectName=${SONAR_PROJECT_NAME} \
                                -Dsonar.sources=app/backend \
                                -Dsonar.sourceEncoding=UTF-8
                        """
                    }
                }
            }
        }


        // ============================================================
        // 4. SONARQUBE QUALITY GATE
        // ============================================================
        stage('SonarQube Quality Gate') {

            steps {

                echo "Waiting for SonarQube Quality Gate..."

                timeout(time: 5, unit: 'MINUTES') {

                    waitForQualityGate abortPipeline: true
                }
            }
        }


        // ============================================================
        // 5. BUILD DOCKER IMAGE
        // ============================================================
        stage('Build Docker Image') {

            steps {

                echo "Building CloudCart backend Docker image..."

                sh '''
                    docker build --no-cache \
                        -t ${DOCKERHUB_REPO}:${IMAGE_TAG} \
                        ./app/backend

                    echo "========================================"
                    echo "Docker Image Created"
                    echo "========================================"

                    docker images ${DOCKERHUB_REPO}:${IMAGE_TAG}
                '''
            }
        }


        // ============================================================
        // 6. TEST DOCKER IMAGE
        // ============================================================
        stage('Test Docker Image') {

            steps {

                echo "Testing Docker image..."

                sh '''
                    echo "========================================"
                    echo "Python Version"
                    echo "========================================"

                    docker run --rm \
                        ${DOCKERHUB_REPO}:${IMAGE_TAG} \
                        python --version


                    echo "========================================"
                    echo "Application Files"
                    echo "========================================"

                    docker run --rm \
                        ${DOCKERHUB_REPO}:${IMAGE_TAG} \
                        ls -la /app
                '''
            }
        }


        // ============================================================
        // 7. TRIVY SECURITY SCAN
        // ============================================================
        stage('Trivy Security Scan') {

            steps {

                echo "Scanning Docker image for HIGH and CRITICAL vulnerabilities..."

                sh '''
                    trivy image \
                        --ignore-unfixed \
                        --severity HIGH,CRITICAL \
                        --scanners vuln \
                        --exit-code 1 \
                        ${TRIVY_IMAGE}
                '''
            }
        }


        // ============================================================
        // 8. DOCKER HUB LOGIN
        // ============================================================
        stage('Docker Hub Login') {

            steps {

                echo "Logging in to Docker Hub..."

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {

                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login \
                            --username "$DOCKER_USERNAME" \
                            --password-stdin
                    '''
                }
            }
        }


        // ============================================================
        // 9. PUSH IMAGE
        // ============================================================
        stage('Push Docker Image') {

            steps {

                echo "Pushing Docker image to Docker Hub..."

                sh '''
                    docker push ${DOCKERHUB_REPO}:${IMAGE_TAG}
                '''
            }
        }


        // ============================================================
        // 10. DEPLOY TO KUBERNETES
        // ============================================================
        stage('Deploy to Kubernetes') {

            steps {

                echo "Deploying CloudCart backend to Kubernetes..."

                sh '''
                    echo "========================================"
                    echo "Kubernetes Nodes"
                    echo "========================================"

                    kubectl get nodes


                    echo "========================================"
                    echo "Applying Deployment"
                    echo "========================================"

                    kubectl apply \
                        -f kubernetes/backend-deployment.yaml


                    echo "========================================"
                    echo "Applying Service"
                    echo "========================================"

                    kubectl apply \
                        -f kubernetes/backend-service.yaml


                    echo "========================================"
                    echo "Updating Image"
                    echo "========================================"

                    kubectl set image deployment/${K8S_DEPLOYMENT} \
                        ${K8S_CONTAINER}=${DOCKERHUB_REPO}:${IMAGE_TAG}


                    echo "========================================"
                    echo "Waiting for Rollout"
                    echo "========================================"

                    kubectl rollout status \
                        deployment/${K8S_DEPLOYMENT} \
                        --timeout=180s
                '''
            }
        }


        // ============================================================
        // 11. VERIFY KUBERNETES DEPLOYMENT
        // ============================================================
        stage('Verify Deployment') {

            steps {

                sh '''
                    echo "========================================"
                    echo "Pods"
                    echo "========================================"

                    kubectl get pods -o wide


                    echo "========================================"
                    echo "Services"
                    echo "========================================"

                    kubectl get svc


                    echo "========================================"
                    echo "Deployment"
                    echo "========================================"

                    kubectl get deployment ${K8S_DEPLOYMENT}


                    echo "========================================"
                    echo "Deployed Image"
                    echo "========================================"

                    kubectl get deployment ${K8S_DEPLOYMENT} \
                        -o jsonpath='{.spec.template.spec.containers[0].image}'

                    echo ""

                    echo "========================================"
                    echo "Kubernetes Deployment Successful"
                    echo "========================================"
                '''
            }
        }


        // ============================================================
        // 12. APPLICATION HEALTH CHECK
        // ============================================================
        stage('Application Health Check') {

            steps {

                echo "Checking CloudCart application health..."

                sh '''
                    echo "========================================"
                    echo "Starting Port Forward"
                    echo "========================================"

                    kubectl port-forward \
                        service/${K8S_SERVICE} \
                        5001:5000 \
                        > /tmp/cloudcart-port-forward.log 2>&1 &

                    PORT_FORWARD_PID=$!

                    sleep 5


                    echo "========================================"
                    echo "Health Endpoint"
                    echo "========================================"

                    curl -f http://localhost:5001/health

                    echo ""


                    echo "========================================"
                    echo "Root Endpoint"
                    echo "========================================"

                    curl -f http://localhost:5001/

                    echo ""


                    echo "========================================"
                    echo "Stopping Port Forward"
                    echo "========================================"

                    kill ${PORT_FORWARD_PID} || true


                    echo "========================================"
                    echo "Application Health Check PASSED"
                    echo "========================================"
                '''
            }
        }
    }


    // ================================================================
    // POST ACTIONS
    // ================================================================
    post {

        success {

            echo '''
============================================================
          CloudCart CI/CD PIPELINE SUCCESSFUL
============================================================

✓ Source code checked out
✓ SonarQube code analysis completed
✓ SonarQube Quality Gate passed
✓ Docker image built
✓ Docker image tested
✓ Trivy security scan passed
✓ Image pushed to Docker Hub
✓ Kubernetes deployment successful
✓ Kubernetes rollout completed
✓ Application health check passed

============================================================
'''
        }


        failure {

            echo '''
============================================================
            CloudCart CI/CD PIPELINE FAILED
============================================================

Check the failed Jenkins stage and console output.

============================================================
'''
        }


        always {

            echo "Cleaning Docker resources..."

            sh '''
                docker logout || true
                docker image prune -f || true
            '''
        }
    }
}
