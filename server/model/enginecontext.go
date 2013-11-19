package model

import (
	"appengine"
	"appengine/datastore"
	"errors"
)

type AppEngineDB struct {
	ctx appengine.Context
}

func NewAppEngineDB(ctx appengine.Context) *AppEngineDB {
	return &AppEngineDB{ctx}
}

func (db *AppEngineDB) SaveGeneralData(d *GeneralData) error {
	if d.UserID == "" {
		return errors.New("model: invalid UserID")
	}

	var (
		key *datastore.Key
		err error
	)

	if d.Key == "" {
		key = datastore.NewIncompleteKey(db.ctx, "GeneralData", nil)
	} else {
		key, err = datastore.DecodeKey(d.Key)
		if err != nil {
			return err
		}
	}

	key, err = datastore.Put(db.ctx, key, d)
	if err != nil {
		return err
	}

	d.Key = key.Encode()
	return nil
}

func (db *AppEngineDB) GetGeneralData(uID string, t DataType) (*GeneralData, error) {
	q := datastore.NewQuery("GeneralData").
		Filter("UserID =", uID).
		Filter("Type =", t).
		Limit(1)

	it := q.Run(db.ctx)
	d := &GeneralData{}
	key, err := it.Next(d)
	if err != nil && err != datastore.Done {
		return nil, err
	}

	d.Key = key.Encode()
	return d, nil
}

func (db *AppEngineDB) DelGeneralData(k string) error {
	key, err := datastore.DecodeKey(k)
	if err != nil {
		return err
	}

	return datastore.Delete(db.ctx, key)
}

func (db *AppEngineDB) SaveUsages(u []Usage) error {
	n := len(u)
	keys := make([]*datastore.Key, n, n)
	for i, v := range u {
		if v.UserID != "" {
			if v.Key != "" {
				key, err := datastore.DecodeKey(v.Key)
				if err == nil {
					keys[i] = key
				}
			} else {
				keys[i] = datastore.NewIncompleteKey(db.ctx, "Usage", nil)
			}
		}
	}

	keys, err := datastore.PutMulti(db.ctx, keys, u)
	if err != nil {
		return err
	}

	for i, v := range keys {
		u[i].Key = v.Encode()
	}
	return nil
}

func (db *AppEngineDB) GetUsages(uID string, from, to uint64) ([]Usage, error) {
	var uLst []Usage
	keys, err := datastore.NewQuery("Usage").Filter("UserID =", uID).
		Filter("DateStamp >=", from).
		Filter("DateStamp <=", to).
		Order("-DateStamp").
		GetAll(db.ctx, &uLst)

	if err != nil {
		return nil, err
	}

	for i, v := range keys {
		uLst[i].Key = v.Encode()
	}

	return uLst, nil
}

func (db *AppEngineDB) GetUpdatedUsages(uID string, updateFrom, to uint64) ([]Usage, error) {
	var uLst []Usage
	keys, err := datastore.NewQuery("Usage").Filter("UserID =", uID).
		Filter("LastUpdate >=", updateFrom).
		Filter("LastUpdate <=", to).
		Order("-LastUpdate").
		GetAll(db.ctx, &uLst)

	if err != nil {
		return nil, err
	}

	for i, v := range keys {
		uLst[i].Key = v.Encode()
	}

	return uLst, nil
}

func (db *AppEngineDB) DelUsages(k []string) error {
	n := len(k)
	keys := make([]*datastore.Key, n, n)
	for i, v := range k {
		key, err := datastore.DecodeKey(v)
		if err == nil {
			keys[i] = key
		}
	}
	return datastore.DeleteMulti(db.ctx, keys)
}
