pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t cloudcart-backend ./app/backend'
            }
        }

        stage('Stop Old Container') {
            steps {
                sh '''
                docker stop cloudcart-backend || true
                docker rm cloudcart-backend || true
                '''
            }
        }

        stage('Deploy Container') {
            steps {
                sh '''
                docker run -d \
                  --name cloudcart-backend \
                  -p 5000:5000 \
                  cloudcart-backend
                '''
            }
        }

        stage('Verify Container') {
            steps {
                sh 'docker ps'
            }
        }

        stage('Health Check') {
            steps {
                sh 'curl http://localhost:5000/health'
            }
        }
    }

    post {
        success {
            echo 'Deployment Successful!'
        }

        failure {
            echo 'Deployment Failed!'
            sh 'docker ps -a'
        }
    }
}
