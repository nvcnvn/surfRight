package model

type DataType uint8

const (
	T_SETTING DataType = iota
	T_RULE
)

type GeneralData struct {
	Key        string `datastore:"-"`
	UserID     string
	Content    string `datastore:",noindex"`
	Type       DataType
	LastUpdate uint64
}

type Usage struct {
	Key        string `datastore:"-"`
	UserID     string
	Content    string `datastore:",noindex"`
	DateStamp  uint64
	LastUpdate uint64
}

type DataManager interface {
	SaveGeneralData(d *GeneralData) error
	GetGeneralData(uID string, t DataType) (*GeneralData, error)
	DelGeneralData(k string) error

	SaveUsages([]Usage) error
	GetUsages(uID string, from, to uint64) ([]Usage, error)
	GetUpdatedUsages(uID string, updateFrom, to uint64) ([]Usage, error)
	DelUsages(k []string) error
}
