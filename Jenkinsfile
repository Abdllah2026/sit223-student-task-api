pipeline {
    agent any

    stages {

        stage('Build') {
            steps {
                echo 'Installing dependencies and creating build artifact...'
                bat 'npm ci'
                bat 'npm pack'
                archiveArtifacts artifacts: '*.tgz', fingerprint: true
            }
        }

        stage('Test') {
            steps {
                echo 'Running automated tests...'
                bat 'npm test'
            }
        }

        stage('Code Quality') {
            steps {
                echo 'Running ESLint code quality check...'
                bat 'npx eslint app.js app.test.js'
            }
        }

        stage('Security') {
            steps {
                echo 'Running npm security audit...'
                bat 'npm audit --audit-level=high'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application to local deployment folder...'
                bat '''
                if exist deployed-app rmdir /s /q deployed-app
                mkdir deployed-app
                copy app.js deployed-app\\app.js
                copy package.json deployed-app\\package.json
                copy package-lock.json deployed-app\\package-lock.json
                '''
            }
        }

        stage('Release') {
            steps {
                echo 'Creating release version...'
                bat 'echo Release version 1.0.%BUILD_NUMBER% > release-version.txt'
                bat 'type release-version.txt'
                archiveArtifacts artifacts: 'release-version.txt', fingerprint: true
            }
        }

        stage('Monitoring') {
            steps {
                echo 'Running application health-check test...'
                bat 'npm test -- --runTestsByPath app.test.js'
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