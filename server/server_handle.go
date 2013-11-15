package server

import (
	"appengine"
	"github.com/kidstuff/toys"
	"github.com/kidstuff/toys/view"
	"net/http"
	"path"
)

type route struct {
	pattern     string
	interceptor func(http.ResponseWriter, *http.Request) bool
	fn          func(*context)
}

type context struct {
	toys.Context
	tmpl *view.View
	ctx  appengine.Context
}

func (c *context) View(page string, data interface{}) error {
	return c.tmpl.Load(c, page, data)
}

func (c *context) Close() error {
	return nil
}

type handler struct {
	path           string
	_subRoutes     []route
	_defaultHandle func(*context)
	tmpl           *view.View
}

func (h *handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if h.path == r.URL.Path {
		c := h.newcontext(w, r)
		h._defaultHandle(&c)
		c.Close()
		return
	}
	for _, rt := range h._subRoutes {
		if match(path.Join(h.path, rt.pattern), r.URL.Path) {
			c := h.newcontext(w, r)
			rt.fn(&c)
			c.Close()
			return
		}
	}
}

func (h *handler) newcontext(w http.ResponseWriter, r *http.Request) context {
	c := context{}
	c.Init(w, r)
	c.SetPath(h.path)
	c.tmpl = h.tmpl
	c.ctx = appengine.NewContext(r)
	return c
}

// Handler returns a http.Handler
func Handler(path string, tmpl *view.View) *handler {
	h := &handler{}
	h.path = path
	h.tmpl = tmpl
	h.initSubRoutes()

	return h
}

// match is a wrapper function for path.Math
func match(pattern, name string) bool {
	ok, err := path.Match(pattern, name)
	if err != nil {
		return false
	}
	return ok
}
