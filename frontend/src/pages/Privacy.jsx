import React from 'react'

const Privacy = () => {
  return (
    <div className="max-w-3xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Privacy Policy</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Last updated: May 4, 2026
        </p>
      </header>

      <section className="space-y-4 text-gray-700 dark:text-gray-300">
        <p>
          ModelShare stores account details you provide, such as your email, profile name, and models you upload.
          We use this information only to operate the platform and improve user experience.
        </p>
        <p>
          Uploaded files and profile content may be visible to other users depending on your sharing settings.
          Avoid uploading sensitive or confidential information.
        </p>
        <p>
          If you need your account data removed, contact support through the Contact page and include your account email.
        </p>
      </section>
    </div>
  )
}

export default Privacy
