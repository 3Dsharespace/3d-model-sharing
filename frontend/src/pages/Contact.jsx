import React from 'react'

const Contact = () => {
  return (
    <div className="max-w-3xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Contact</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Need help with your account, uploads, or policy requests? Reach out below.
        </p>
      </header>

      <section className="space-y-4 text-gray-700 dark:text-gray-300">
        <p>
          Email: <a className="underline hover:no-underline" href="mailto:support@modelshare.app">support@modelshare.app</a>
        </p>
        <p>
          Response time: Usually within 1-2 business days.
        </p>
        <p>
          Include your username and a short description of the issue so we can help faster.
        </p>
      </section>
    </div>
  )
}

export default Contact
