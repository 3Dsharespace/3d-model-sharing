import React from 'react'

const Terms = () => {
  return (
    <div className="max-w-3xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Terms of Service</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Last updated: May 4, 2026
        </p>
      </header>

      <section className="space-y-4 text-gray-700 dark:text-gray-300">
        <p>
          By using ModelShare, you agree to upload only content you own or are authorized to share.
          You are responsible for all activity performed from your account.
        </p>
        <p>
          Do not upload illegal, harmful, or copyrighted material without permission. We may remove content
          or suspend accounts that violate these terms.
        </p>
        <p>
          The service is provided as-is. We may update features, pricing, or policies at any time with notice.
        </p>
      </section>
    </div>
  )
}

export default Terms
