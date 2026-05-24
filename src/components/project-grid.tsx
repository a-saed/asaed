import projects from '@/_data/projects.json'

interface Project {
  id: string
  title: string
  description: string
  tools?: string[]
  repo?: string
  url?: string
  featured?: boolean
}

export function ProjectGrid() {
  const featured = (projects as Project[]).filter((p) => p.featured)

  return (
    <div>
      <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-5">Projects</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {featured.map((project) => (
          <div
            key={project.id}
            className="border border-neutral-900 rounded-md p-4 hover:border-neutral-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-medium text-neutral-200">{project.title}</p>
              <div className="flex gap-3">
                {project.repo && (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-neutral-600 hover:text-neutral-300 transition-colors"
                  >
                    repo ↗
                  </a>
                )}
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-neutral-600 hover:text-neutral-300 transition-colors"
                  >
                    live ↗
                  </a>
                )}
              </div>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed mb-3">
              {project.description}
            </p>
            {project.tools && project.tools.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {project.tools.map((tool) => (
                  <span key={tool} className="text-xs text-neutral-700 font-mono">
                    {tool}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
