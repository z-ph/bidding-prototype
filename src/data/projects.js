// 项目 mock 数据存储
// 用于保存项目创建后的结构化数据，供开标大厅、投标报名等后续环节读取标段级信息

const PROJECTS_KEY = 'bidding-projects'

function load(key, defaults) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : defaults
  } catch {
    return defaults
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage errors
  }
}

function generateId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const seq = String(Math.floor(Math.random() * 9000) + 1000)
  return `P${date}${seq}`
}

export const projectStore = {
  getProjects() {
    return load(PROJECTS_KEY, [])
  },
  saveProjects(projects) {
    save(PROJECTS_KEY, projects)
  },
  getProjectById(id) {
    return this.getProjects().find((p) => String(p.id) === String(id))
  },
  saveProject(project) {
    const projects = this.getProjects()
    const idx = projects.findIndex((p) => String(p.id) === String(project.id))
    const enriched = {
      ...project,
      id: project.id || generateId(),
      createTime: project.createTime || new Date().toISOString()
    }
    if (idx >= 0) {
      projects[idx] = { ...projects[idx], ...enriched }
    } else {
      projects.unshift(enriched)
    }
    this.saveProjects(projects)
    return enriched
  }
}
