package server

import (
	"github.com/kidstuff/toys/view"
)

func (c *context) ViewData(title string) view.ViewData {
	data := view.NewViewData(title)
	data["BasePath"] = func(path string) string { return c.BasePath(path) }
	return data
}
