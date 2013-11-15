package server

func (h *handler) initSubRoutes() {
	h._defaultHandle = HandleIndex
	h._subRoutes = []route{
		route{pattern: "/", fn: HandleIndex},
		route{pattern: "/sync", fn: HandleSync},
		route{pattern: "/login", fn: HandleLogin},
	}
}
