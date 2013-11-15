package server

func HandleIndex(c *context) {
	c.View("index_detail.tmpl", nil)
}
