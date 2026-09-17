pipeline {
    agent any

    environment {
        IMAGE_NAME = 'sit223-student-task-api'
        TEST_CONTAINER = 'sit223-test'
        PROD_CONTAINER = 'sit223-prod'
        TEST_PORT = '3001'
        PROD_PORT = '3002'
        VERSION = '2.0.0'
    }

    stages {

        stage('Build') {
            steps {
                echo 'Building Node.js application and Docker image...'

                sh 'npm ci'

                sh 'npm run build'

                archiveArtifacts artifacts: '*.tgz', fingerprint: true

                sh 'docker build -t ${IMAGE_NAME}:${VERSION} .'
            }
        }

        stage('Test') {
            steps {
                echo 'Running automated unit and API tests...'

                sh 'npm test'
            }
        }

        stage('Code Quality') {
            steps {
                echo 'Running ESLint with zero-warning quality gate...'

                sh 'npm run lint'
            }
        }

        stage('Security') {
            steps {
                echo 'Scanning project dependencies for known vulnerabilities...'

                sh 'npm run security'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application to Docker test environment...'

                sh '''
                    docker rm -f ${TEST_CONTAINER} || true
                    docker run -d \
                        --name ${TEST_CONTAINER} \
                        -p ${TEST_PORT}:3000 \
                        ${IMAGE_NAME}:${VERSION}
                '''

                sh 'sleep 5'

                sh '''
                    STATUS=$(curl -s http://host.docker.internal:${TEST_PORT}/health)

                    echo "Test environment health response: $STATUS"

                    echo "$STATUS" | grep '"status":"UP"'
                '''
            }
        }

        stage('Release') {
            steps {
                echo 'Promoting tested Docker image to release environment...'

                sh '''
                    docker tag \
                        ${IMAGE_NAME}:${VERSION} \
                        ${IMAGE_NAME}:release-${VERSION}
                '''

                sh '''
                    docker rm -f ${PROD_CONTAINER} || true

                    docker run -d \
                        --name ${PROD_CONTAINER} \
                        -p ${PROD_PORT}:3000 \
                        ${IMAGE_NAME}:release-${VERSION}
                '''

                sh 'sleep 5'
            }
        }

        stage('Monitoring') {
            steps {
                echo 'Monitoring released application health and API availability...'

                sh '''
                    HEALTH=$(curl -s http://host.docker.internal:${PROD_PORT}/health)

                    echo "Production health response: $HEALTH"

                    echo "$HEALTH" | grep '"status":"UP"'
                '''

                sh '''
                    TASKS=$(curl -s http://host.docker.internal:${PROD_PORT}/api/tasks)

                    echo "Production API response: $TASKS"

                    echo "$TASKS" | grep 'Review Jenkins pipeline'
                '''
            }
        }
    }

    post {
        success {
            echo 'All 7 DevOps pipeline stages completed successfully.'
        }

        failure {
            echo 'Pipeline failed. Review the failed stage before release.'
        }
    }
}