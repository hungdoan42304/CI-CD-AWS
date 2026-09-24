pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    triggers {
        githubPush()
    }

    environment {
        IMAGE_NAME = 'sample-ci-app'
        APP_NAME = 'sample-ci-app'
        PREVIOUS_NAME = 'sample-ci-app-previous'
        APP_PORT = '3000'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    docker build \
                      --progress=plain \
                      --target runtime \
                      -t ${IMAGE_NAME}:${BUILD_NUMBER} \
                      -t ${IMAGE_NAME}:latest .
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    set -eu

                    docker rm -f ${PREVIOUS_NAME} 2>/dev/null || true

                    if docker ps -a --format '{{.Names}}' | grep -qx "${APP_NAME}"; then
                        docker stop ${APP_NAME}
                        docker rename ${APP_NAME} ${PREVIOUS_NAME}
                    fi

                    docker run -d \
                      --name ${APP_NAME} \
                      --restart unless-stopped \
                      -p ${APP_PORT}:3000 \
                      ${IMAGE_NAME}:${BUILD_NUMBER}
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    set -eu

                    for i in $(seq 1 12); do
                        STATUS=$(docker inspect \
                          --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' \
                          ${APP_NAME})

                        echo "Health status: ${STATUS}"

                        if [ "${STATUS}" = "healthy" ]; then
                            exit 0
                        fi

                        if [ "${STATUS}" = "unhealthy" ]; then
                            break
                        fi

                        sleep 5
                    done

                    echo "New deployment failed health check."

                    docker logs --tail 100 ${APP_NAME} || true
                    docker rm -f ${APP_NAME} || true

                    if docker ps -a --format '{{.Names}}' | grep -qx "${PREVIOUS_NAME}"; then
                        docker rename ${PREVIOUS_NAME} ${APP_NAME}
                        docker start ${APP_NAME}
                        echo "Rolled back to previous container."
                    fi

                    exit 1
                '''
            }
        }
    }

    post {
        success {
            sh 'docker rm -f ${PREVIOUS_NAME} 2>/dev/null || true'
            echo 'Deployment successful.'
        }

        failure {
            echo 'Pipeline failed. Check the stage logs above.'
        }
    }
}
