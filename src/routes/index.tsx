import { createFileRoute } from '@tanstack/react-router'

const App = () => {
  return (
    <>
      <section className="relative py-20 px-6 text-center overflow-hidden">
       Time to learn 📚
      </section>
    </>
  )
}

export const Route = createFileRoute('/')({ component: App })

