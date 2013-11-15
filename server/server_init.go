package server

import (
	"fmt"
	"github.com/kidstuff/toys/view"
	"net/http"
)

func init() {
	tmpl := view.NewView("templates")
	tmpl.ResourcePrefix = "/statics"
	tmpl.Watch = false
	if err := tmpl.Parse("default"); err != nil {
		fmt.Println(err.Error())
	}

	http.Handle("/", Handler("/", tmpl))
}
