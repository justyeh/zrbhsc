package models

import (
	"backend/global"
	"errors"
)

type Permission struct {
	ID       string       `json:"id"`
	Code     string       `json:"code" binding:"required"`
	Name     string       `json:"name"  binding:"required"`
	Pid      string       `json:"pid"`
	Sort     int          `json:"sort"`
	Children []Permission `json:"children"`
	CreateAt int64        `json:"createAt"`
	UpdateAt int64        `json:"updateAt"`
}

func (permission *Permission) TableName() string {
	return "permission"
}

func (permission *Permission) PermissionTree() ([]Permission, error) {
	list := []Permission{}
	db := global.MYSQL
	if len(permission.Name) > 0 {
		db = db.Where("name LIKE ?", "%"+permission.Name+"%")
	}
	err := db.Order("sort ASC").Order("create_at DESC").Find(&list).Error
	return list, err
}

func (permission *Permission) Create() error {
	var count int
	err := global.MYSQL.Table("permission").Where("code = ? ", permission.Code).Count(&count).Error
	if err != nil {
		return err
	}
	if count > 0 {
		return errors.New("该权限CODE已被使用，无法创建")
	}
	return global.MYSQL.Create(permission).Error
}

func (permission *Permission) Delete(ids []string) error {
	tx := global.MYSQL.Begin()
	if err := tx.Exec("DELETE FROM role_permission WHERE permission_id IN (?)", permission.ID).Error; err != nil {
		tx.Rollback()
		return err
	}
	if err := tx.Exec("DELETE FROM permission WHERE id IN (?)", ids).Error; err != nil {
		tx.Rollback()
		return err
	}
	tx.Commit()
	return nil
}

func (permission *Permission) Update() error {
	var count int
	err := global.MYSQL.Table("permission").Where("id <> ? AND code = ?", permission.ID, permission.Code).Count(&count).Error
	if err != nil {
		return err
	}
	if count > 0 {
		return errors.New("修改失败，该权限CODE已被占用")
	}
	return global.MYSQL.Omit("create_at").Save(permission).Error
}
