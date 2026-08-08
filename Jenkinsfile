pipeline {

    agent any

    environment {

        // Docker Hub repository
        DOCKERHUB_REPO = "pavanorappu/cloudcart-backend"

        // Unique immutable tag for every Jenkins build
        IMAGE_TAG = "${BUILD_NUMBER}"

        // Kubernetes
        K8S_DEPLOYMENT = "cloudcart-backend"
        K8S_CONTAINER = "backend"

        // Image used by Trivy
        TRIVY_IMAGE = "pavanorappu/cloudcart-backend:${BUILD_NUMBER}"
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
                    echo "Docker Version"
                    echo "========================================"

                    docker --version


                    echo "========================================"
                    echo "Docker Daemon"
                    echo "========================================"

                    docker info > /dev/null


                    echo "========================================"
                    echo "Kubectl Version"
                    echo "========================================"

                    kubectl version --client


                    echo "========================================"
                    echo "Trivy Version"
                    echo "========================================"

                    trivy --version
                '''
            }
        }


        // ============================================================
        // 3. BUILD DOCKER IMAGE
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
        // 4. TEST DOCKER IMAGE
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
        // 5. TRIVY SECURITY SCAN
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
        // 6. DOCKER HUB LOGIN
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
        // 7. PUSH IMAGE
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
        // 8. DEPLOY TO KUBERNETES
        // ============================================================
        stage('Deploy to Kubernetes') {
            steps {

                echo "Deploying CloudCart backend to Kubernetes..."

                sh '''
                    echo "========================================"
                    echo "Kubernetes Cluster"
                    echo "========================================"

                    kubectl get nodes


                    echo "========================================"
                    echo "Applying Backend Deployment"
                    echo "========================================"

                    kubectl apply \
                        -f kubernetes/backend-deployment.yaml


                    echo "========================================"
                    echo "Applying Backend Service"
                    echo "========================================"

                    kubectl apply \
                        -f kubernetes/backend-service.yaml


                    echo "========================================"
                    echo "Updating Backend Image"
                    echo "========================================"

                    kubectl set image deployment/${K8S_DEPLOYMENT} \
                        ${K8S_CONTAINER}=${DOCKERHUB_REPO}:${IMAGE_TAG}


                    echo "========================================"
                    echo "Waiting for Kubernetes Rollout"
                    echo "========================================"

                    kubectl rollout status \
                        deployment/${K8S_DEPLOYMENT} \
                        --timeout=180s
                '''
            }
        }


        // ============================================================
        // 9. VERIFY DEPLOYMENT
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
                    echo "CloudCart Backend Deployment Successful"
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
              CloudCart CI/CD Pipeline SUCCESSFUL
            ============================================================

            ✓ Source code checked out
            ✓ Docker image built
            ✓ Docker image tested
            ✓ Trivy security scan passed
            ✓ Image pushed to Docker Hub
            ✓ Kubernetes deployment successful
            ✓ Rollout completed successfully

            ============================================================
            '''
        }


        failure {

            echo '''
            ============================================================
              CloudCart CI/CD Pipeline FAILED
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
