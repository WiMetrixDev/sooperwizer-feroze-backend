pipeline {
    agent none
    options {
    skipDefaultCheckout true
  }
    stages {
        stage('Master Branch') {
            agent {
                label 'built-in'
            }
            when {
                branch 'master'
            }
            steps {
                echo "Hi from Master Branch"
            }
        }
        stage('Staging Branch') {
            agent {
                label 'jenkins-slave'
            }
            when {
                branch 'staging'
            }
            steps {
                 sh '/home/wimetrix/workspace/hamza/SooperwizerBackendSQL/SooperwizerBackendSQL.sh stag'
            }
        }
        stage('Development Branch') {
            agent {
                label 'built-in'
            }
            when {
                branch 'dev'
            }
            steps {
                sh '/home/wimetrix/workspace/SooperwizerBackendSQL/SooperwizerBackendSQL.sh dev'
            }
        }
    }
}
