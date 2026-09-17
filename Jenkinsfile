pipeline {
    agent any

    environment {
        IMAGE_NAME = 'sit223-student-task-api'
        TEST_CONTAINER = 'sit223-test'
        PROD_CONTAINER = 'sit223-prod'
        PROM_CONTAINER = 'sit223-prometheus'
        ALERT_CONTAINER = 'sit223-alertmanager'
        TEST_PORT = '3001'
        PROD_PORT = '3002'
        VERSION = '2.0.0'
    }

    stages {

        stage('Build') {
            steps {
                echo 'Building the Node.js application and Docker image...'

                sh 'npm ci'
                sh 'npm run build'

                archiveArtifacts artifacts: '*.tgz', fingerprint: true

                sh 'docker build -t ${IMAGE_NAME}:${VERSION} .'
            }
        }

        stage('Test') {
            steps {
                echo 'Running automated tests for API functionality...'

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
                echo 'Scanning project dependencies for security vulnerabilities...'

                sh 'npm run security'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying the application to the Docker test environment...'

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

                sh '''
                    TASKS=$(curl -s http://host.docker.internal:${TEST_PORT}/api/tasks)

                    echo "Test environment API response: $TASKS"

                    echo "$TASKS" | grep 'Review Jenkins pipeline'
                '''
            }
        }

        stage('Release') {
            steps {
                echo 'Promoting the tested Docker image to the release environment...'

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

                sh '''
                    STATUS=$(curl -s http://host.docker.internal:${PROD_PORT}/health)

                    echo "Release environment health response: $STATUS"

                    echo "$STATUS" | grep '"status":"UP"'
                '''
            }
        }

        stage('Monitoring') {
            steps {
                echo 'Checking production metrics, Prometheus, and Alertmanager...'

                sh '''
                    METRICS=$(curl -s http://host.docker.internal:${PROD_PORT}/metrics)

                    echo "$METRICS" | grep 'process_cpu_user_seconds_total'

                    echo "Production metrics endpoint is working."
                '''

                sh '''
                    if ! docker ps --format '{{.Names}}' | grep -q "^${PROM_CONTAINER}$"; then
                        echo "Starting Prometheus..."

                        docker rm -f ${PROM_CONTAINER} || true

                        docker run -d \
                            --name ${PROM_CONTAINER} \
                            -p 9090:9090 \
                            -v "$WORKSPACE/prometheus.yml:/etc/prometheus/prometheus.yml" \
                            -v "$WORKSPACE/alerts.yml:/etc/prometheus/alerts.yml" \
                            prom/prometheus:latest
                    else
                        echo "Prometheus is already running."
                    fi
                '''

                sh '''
                    if ! docker ps --format '{{.Names}}' | grep -q "^${ALERT_CONTAINER}$"; then
                        echo "Starting Alertmanager..."

                        docker rm -f ${ALERT_CONTAINER} || true

                        docker run -d \
                            --name ${ALERT_CONTAINER} \
                            -p 9093:9093 \
                            -v "$WORKSPACE/alertmanager.yml:/etc/alertmanager/alertmanager.yml" \
                            prom/alertmanager:latest
                    else
                        echo "Alertmanager is already running."
                    fi
                '''

                sh 'sleep 8'

                sh '''
                    PROM_STATUS=$(curl -s \
                        "http://host.docker.internal:9090/api/v1/query?query=up%7Bjob%3D%22sit223-production%22%7D")

                    echo "Prometheus API response: $PROM_STATUS"

                    echo "$PROM_STATUS" | grep '"value"'
                    echo "$PROM_STATUS" | grep '"1"'
                '''

                sh '''
                    ALERT_STATUS=$(curl -s http://host.docker.internal:9093/api/v2/status)

                    echo "$ALERT_STATUS" | grep 'uptime'

                    echo "Alertmanager API is working."
                '''

                echo 'Monitoring and alerting services are working successfully.'
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