pipeline {
    agent any

    stages {

        stage('Build') {
            steps {
                echo 'Installing dependencies and creating build artifact...'
                sh 'npm ci'
                sh 'npm pack'
                archiveArtifacts artifacts: '*.tgz', fingerprint: true
            }
        }

        stage('Test') {
            steps {
                echo 'Running automated tests...'
                sh 'npm test'
            }
        }

        stage('Code Quality') {
            steps {
                echo 'Running ESLint code quality check...'
                sh 'npx eslint app.js app.test.js'
            }
        }

        stage('Security') {
            steps {
                echo 'Running npm security audit...'
                sh 'npm audit --audit-level=high'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application to local deployment folder...'
                sh '''
                    rm -rf deployed-app
                    mkdir -p deployed-app
                    cp app.js deployed-app/app.js
                    cp package.json deployed-app/package.json
                    cp package-lock.json deployed-app/package-lock.json
                '''
            }
        }

        stage('Release') {
            steps {
                echo 'Creating release version...'
                sh 'echo "Release version 1.0.${BUILD_NUMBER}" > release-version.txt'
                sh 'cat release-version.txt'
                archiveArtifacts artifacts: 'release-version.txt', fingerprint: true
            }
        }

        stage('Monitoring') {
            steps {
                echo 'Running application health-check test...'
                sh 'npm test -- --runTestsByPath app.test.js'
            }
        }
    }

    post {
        success {
            echo 'All 7 DevOps pipeline stages completed successfully.'
        }

        failure {
            echo 'The pipeline failed. Check the stage output for details.'
        }
    }
}