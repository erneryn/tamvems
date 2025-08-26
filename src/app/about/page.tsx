export default function About() {
  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            About TamVems
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A carefully crafted boilerplate to help you build amazing web applications faster.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-gray-50 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What&apos;s Included</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• Next.js 14+ with App Router</li>
              <li>• TypeScript for type safety</li>
              <li>• Tailwind CSS for styling</li>
              <li>• ESLint for code quality</li>
              <li>• Responsive components</li>
              <li>• Modern project structure</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Performance First</h3>
              <p className="text-gray-700">
                Built with performance in mind, using the latest Next.js features for optimal loading times and SEO.
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Developer Experience</h3>
              <p className="text-gray-700">
                Modern development tools and practices to make building applications enjoyable and productive.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 