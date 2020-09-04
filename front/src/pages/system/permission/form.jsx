import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react'
import { Modal, Form, Input, InputNumber, TreeSelect, notification } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { convertAntdNodeData } from '@/utils/'

import { editPermission, addPermission } from '@/apis/system'

const PermissionForm = ({ permissionData, onSuccess }, ref) => {
  const [visible, setVisible] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [treeData, setTreeData] = useState([{ id: '0', name: '顶级权限' }])
  const [formIns] = useForm()
  const [formData, setFormData] = useState({})

  useEffect(() => {
    setTreeData([{ id: '0', name: '顶级权限', children: permissionData }])
  }, [permissionData])

  const handleSubmit = async (values) => {
    setSubmitLoading(true)
    try {
      const submitData = { ...formData, ...values }
      submitData.id ? await editPermission(submitData) : await addPermission(submitData)
      notification.success({ message: '操作成功' })
      setVisible(false)
      onSuccess()
    } catch (error) {}
    setSubmitLoading(false)
  }

  function init(data = {}) {
    const formData = {
      id: data.id || '',
      name: data.name || '',
      code: data.code || '',
      sort: data.sort ? Number(data.sort) : 1,
      pid: data.pid || '0'
    }
    setFormData(formData)
    formIns.resetFields()
    formIns.setFieldsValue(formData)
    setVisible(true)
  }

  useImperativeHandle(ref, () => {
    return { init }
  })

  return (
    <Modal
      title={formData.id ? '编辑权限' : '新建权限'}
      maskClosable={false}
      keyboard={false}
      visible={visible}
      width={500}
      confirmLoading={submitLoading}
      onCancel={() => setVisible(false)}
      onOk={formIns.submit}
    >
      <Form form={formIns} labelCol={{ span: 4 }} onFinish={handleSubmit}>
        <Form.Item name="name" label="名称" rules={[{ required: true, message: '请填写权限名称!' }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="code"
          label="CODE"
          rules={[
            { required: true, message: '请填写权限CODE!' },
            { pattern: /^[a-z_]*$/, message: '仅允许小写字母、下划线' }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="sort" label="排序">
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="pid" label="父级权限" rules={[{ required: true, message: '请选择父级权限!' }]}>
          <TreeSelect treeData={convertAntdNodeData(treeData)} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default forwardRef(PermissionForm)
