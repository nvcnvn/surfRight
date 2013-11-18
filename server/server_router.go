package server

func (h *handler) initSubRoutes() {
	h._defaultHandle = HandleIndex
	h._subRoutes = []route{
		route{pattern: "/sync.html", fn: HandleSyncHTML},
		route{pattern: "/sync", fn: HandleSync},
	}
}
