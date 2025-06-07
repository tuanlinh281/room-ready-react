
import React, { useState } from 'react'
import Layout from '@/components/layout/Layout'
import LoginForm from '@/components/auth/LoginForm'
import SignUpForm from '@/components/auth/SignUpForm'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)

  const toggleMode = () => {
    setIsLogin(!isLogin)
  }

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-[60vh]">
        {isLogin ? (
          <LoginForm onToggleMode={toggleMode} />
        ) : (
          <SignUpForm onToggleMode={toggleMode} />
        )}
      </div>
    </Layout>
  )
}

export default Auth
