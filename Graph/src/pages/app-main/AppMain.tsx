/*
 * 应用主页。
 * 2051565 
 * 创建于 2022年7月20日。
 */

import {
    CloseOutlined,
    DeleteOutlined,
    DownloadOutlined,
    ImportOutlined,
    InfoCircleOutlined,
    PlusOutlined,
    SaveOutlined,
    StarOutlined,
    UnorderedListOutlined
} from '@ant-design/icons'
import {Button, Drawer, Input, message, Modal, notification, PageHeader, Select, Upload} from 'antd'
import {DefaultOptionType} from 'antd/lib/select'
import {RcFile} from 'antd/lib/upload'
import {FilterFunc} from 'rc-select/lib/Select'
import React from 'react'
import {FreeKeyObject} from '../../data-structure/FreeKeyObject'
import {NodeBase, EdgeBase, Graph} from '../../data-structure/NodeBase'
import {MacroDefines} from '../../MacroDefines'
import {Deque} from '../../components/Deque'
import './AppMain.css'
import TextArea from "antd/es/input/TextArea";
import {GraphCanvas} from "../../components/GraphCanvas";
import {GraphCategoryItemOption} from "echarts/types/src/chart/graph/GraphSeries";

const {Option} = Select

type AppState = {
    /** 聚焦的节点。 */
    nodeSelected: NodeBase | null,

    /** 关系列表抽屉是否可见。 */
    relationDrawerVisible: boolean,

    /** 好友推荐抽屉是否可见。 */
    recommendFriendDrawerVisible: boolean
}

/**
 * 应用主页。含大部分逻辑。
 */
export default class AppMain extends React.Component<any, AppState> {
    state: AppState = {
        nodeSelected: null,
        relationDrawerVisible: false,
        recommendFriendDrawerVisible: false
    }

    /**
     * 节点管理器。含用户和组织。
     */
    private graph = new Graph()
    private dequeRef: React.RefObject<Deque>
    private graphRef: React.RefObject<GraphCanvas>

    /**
     * 窗口大小变更警告锁。
     * 锁开时，不弹出警告。
     */
    private resizeWarningMsgLock = false

    /**
     * 构造。
     */
    constructor(props: any) {
        super(props)
        this.dequeRef = React.createRef()
        this.graphRef = React.createRef()
        // 绑定引用。

        // 首先弹出一个使用说明。
        Modal.info({
            title: 'Graph',
            okText: 'Sure',
            closable: true,
            maskClosable: true,
            centered: true,
            content: <div>
                Author: 2053302<br/>
                Tap input to input some data.<br/>
                Then, tap BFS or DFS to show the stack.<br/>
            </div>,
            icon: <InfoCircleOutlined style={{color: MacroDefines.PRIMARY_COLOR}}/>
        })

        // 注册成员函数。
        this.resizeUpdate = this.resizeUpdate.bind(this)
    }

    /**
     * React 渲染入口函数。
     */
    override render(): React.ReactNode {
        return <div className='pageContainer'>
            <div id='title'>Graph - 2053302</div>
            <Button
                id='importBtn'
                onClick={() => {
                    let importList: String[]
                    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                        importList = e.target.value.split('\n')
                    }
                    const handleOk = () => {
                        this.graph.importGraph(importList)
                        this.graphRef.current?.showGraph(this.graph, 'Graph')
                    }
                    Modal.info({
                        title: 'Import Graph List',
                        okText: 'Sure',
                        closable: true,
                        maskClosable: true,
                        centered: true,
                        content: <div>
                            <TextArea showCount onChange={onChange}/>
                        </div>,
                        icon: <InfoCircleOutlined style={{color: MacroDefines.PRIMARY_COLOR}}/>,
                        onOk: handleOk
                    })
                }}
                type='primary'
                shape='round'
                icon={<DownloadOutlined/>}
            >
                Input Graph
            </Button>
            <Button
                id='dfsBtn'
                onClick={() => {
                    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                        console.log('Change:', e.target.value);
                    };
                    Modal.info({
                        title: 'Import Graph List',
                        okText: 'Sure',
                        closable: true,
                        maskClosable: true,
                        centered: true,
                        content: <div>
                            <TextArea showCount maxLength={100} onChange={onChange}/>
                        </div>,
                        icon: <InfoCircleOutlined style={{color: MacroDefines.PRIMARY_COLOR}}/>
                    })
                }}
                type='primary'
                shape='round'
                icon={<DownloadOutlined/>}
            >
                DFS
            </Button>
            <Button
                id='bfsBtn'
                onClick={() => {
                    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                        console.log('Change:', e.target.value.split('\n'));
                    };
                    Modal.info({
                        title: 'Import Graph List',
                        okText: 'Sure',
                        closable: true,
                        maskClosable: true,
                        centered: true,
                        content: <div>
                            <TextArea showCount onChange={onChange}/>
                        </div>,
                        icon: <InfoCircleOutlined style={{color: MacroDefines.PRIMARY_COLOR}}/>
                    })
                }}
                type='primary'
                shape='round'
                icon={<DownloadOutlined/>}
            >
                BFS
            </Button>

            <GraphCanvas style={{
                borderRadius: '12px',
                background: '#eef7f2af',
                width: '49.2%',
                height: '60%',
                marginLeft: '1.4%',
                boxShadow: '0px 4px 10px #0005'
            }} ref={this.graphRef}/>
            <div className='elementContainer'>
                <div className='controlAreaContainer'>
                    <div className='functionArea normalCard'>
                        { /* 个人或组织信息卡片。 */}
                        { /* 导入导出按钮。 */}
                        <div style={{
                            width: 82,
                            height: '100%',
                            position: 'absolute',
                            right: 12,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            <Upload
                                showUploadList={false}
                                maxCount={1}
                                accept='.sndat'
                            >
                                <Button type='primary'
                                        style={{
                                            width: '100%',
                                            boxShadow: '0px 4px 10px #0005'
                                        }}
                                        shape='round'
                                        icon={<ImportOutlined/>}
                                >导入</Button>
                            </Upload>

                            <Button type='primary'
                                    style={{
                                        width: '100%',
                                        boxShadow: '0px 4px 10px #0005',
                                        marginTop: 10
                                    }}
                                    shape='round'
                                    icon={<SaveOutlined/>}
                            >导出</Button>

                        </div>
                    </div>
                </div>
            </div>
            <div className='elementContainer'>
                <div className='controlAreaContainer'>
                    <div className='functionArea normalCard'>
                        { /* 个人或组织信息卡片。 */}
                        { /* 导入导出按钮。 */}
                        <div style={{
                            width: 82,
                            height: '100%',
                            position: 'absolute',
                            right: 12,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            <Upload
                                showUploadList={false}
                                maxCount={1}
                                accept='.sndat'
                            >
                                <Button type='primary'
                                        style={{
                                            width: '100%',
                                            boxShadow: '0px 4px 10px #0005'
                                        }}
                                        shape='round'
                                        icon={<ImportOutlined/>}
                                >导入</Button>
                            </Upload>

                            <Button type='primary'
                                    style={{
                                        width: '100%',
                                        boxShadow: '0px 4px 10px #0005',
                                        marginTop: 10
                                    }}
                                    shape='round'
                                    icon={<SaveOutlined/>}
                            >导出</Button>

                        </div>
                    </div>
                </div>
            </div>
            <div className='elementContainer'>
                <div className='controlAreaContainer'>
                    <div className='functionArea normalCard'>
                        { /* 个人或组织信息卡片。 */}
                        { /* 导入导出按钮。 */}
                        <div style={{
                            width: 82,
                            height: '100%',
                            position: 'absolute',
                            right: 12,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            <Upload
                                showUploadList={false}
                                maxCount={1}
                                accept='.sndat'
                            >
                                <Button type='primary'
                                        style={{
                                            width: '100%',
                                            boxShadow: '0px 4px 10px #0005'
                                        }}
                                        shape='round'
                                        icon={<ImportOutlined/>}
                                >导入</Button>
                            </Upload>

                            <Button type='primary'
                                    style={{
                                        width: '100%',
                                        boxShadow: '0px 4px 10px #0005',
                                        marginTop: 10
                                    }}
                                    shape='round'
                                    icon={<SaveOutlined/>}
                            >导出</Button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    }

    /**
     * 页面尺寸改变处理。
     * 由于内部组件的绘制依赖原始画面大小，当画面大小改变时，可能无法及时更新。
     * 解决方案：提醒用户刷新浏览器。提醒信息将常驻于页面，直到用户刷新浏览器。
     */
    private resizeUpdate() {
        if (!this.resizeWarningMsgLock) {
            this.resizeWarningMsgLock = true
            notification.error({
                message: '检测到页面尺寸改变',
                description: '请刷新浏览器，否则可能导致显示效果异常。',
                duration: null,
                onClose: () => {
                    message.error({
                        content: '请刷新浏览器，否则可能导致显示效果异常。',
                        duration: 0
                    })
                }
            })

        }
    }

    override componentDidMount() {
        window.addEventListener('resize', this.resizeUpdate)
    }

    override componentWillUnmount() {
        window.removeEventListener('resize', this.resizeUpdate)
    }
}
