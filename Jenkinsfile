pipeline {
  agent any
  stages {
    stage('Staging') {
      steps {
        build(job: 'Get Weather', propagate: true, wait: true)
      }
    }
  }
}