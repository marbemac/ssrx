export default function Footer() {
  return (
    <footer className="container mx-auto max-w-screen-lg px-6 lg:px-0 flex items-center flex-wrap pt-4 pb-32">
      <div className="container flex px-3 py-8">
        <div className="w-full mx-auto flex flex-wrap">
          <div className="flex w-full lg:w-1/2">
            <div className="px-3 md:px-0">
              <h3 className="font-bold text-gray-900">About</h3>
              <p className="pt-4">
                This site is a demo of a React Router SPA using <strong>React Router 6.17</strong> with the experimental
                support for the View Transitions API ✨
              </p>
              <p className="pt-4">
                Huge thanks and shout out to original{' '}
                <a
                  href="https://github.com/Charca/astro-records"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Astro Records
                </a>{' '}
                demo which this is based on 🙌
              </p>
              <p className="pt-4">
                Made with ❤️ by{' '}
                <a
                  href="https://twitter.com/brophdawg11"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Matt Brophy
                </a>{' '}
                (
                <a
                  href="https://github.com/brophdawg11/react-router-records"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Github Repo
                </a>
                )
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
