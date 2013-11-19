package server

import (
	"appengine/user"
	"encoding/json"
	"github.com/nvcnvn/surfRight/server/model"
	"net/http"
)

func HandleSyncHTML(c *context) {

}

func HandleSync(c *context) {
	u := user.Current(c.ctx)
	if u == nil {
		http.Error(c.ResponseWriter, "LOGIN REQUIRED!", http.StatusUnauthorized)
		return
	}

	var u []model.Usage
	err := json.NewDecoder(c.Request.Body).Decode(&u)
	if err != nil {
		http.Error(c.ResponseWriter, err.Error(), http.StatusBadRequest)
		return
	}

	c.db.SaveUsages()
}

func HandleSyncSetting(c *context) {
	u := user.Current(c.ctx)
	if u == nil {
		http.Error(c.ResponseWriter, "LOGIN REQUIRED!", http.StatusForbidden)
		return
	}

}
