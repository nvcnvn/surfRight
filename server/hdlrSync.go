package server

import (
	"appengine/user"
	"net/http"
)

func HandleSync(c *context) {
	u := user.Current(c.ctx)
	if u == nil {
		http.Error(c.ResponseWriter, "Login required!", http.StatusForbidden)
	} else {
		c.Print("hi")
	}
}
