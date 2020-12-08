import { setViewer } from "../js/setviewer.js";
import { constance } from "../js/const.js";
import { init_datetime } from "../js/init_draw_and_view.js"
import { check_datetime_from_input } from "../js/change_draw_and_view.js"
import {Time_select_pulldown,Range_select} from "./child.js"

function create_option(input_data) {
    var list = []
    const data = input_data
    for (var i in input_data) {
        list.push(<option key={i}>{data[i]}</option>);
    }

    return list
}

const _com = new constance()
const region = _com.region
const endpoint = _com.endpoint
const viewerIdArray = _com.viewerIdArray
AWS.config.region = region;
const s3 = new AWS.S3({ apiVersion: "2014-10-01", endpoint: new AWS.Endpoint(endpoint) });
const _propertyArray = _com.aipPropertyArray
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4ODliN2Q1NS1hYTkwLTQxYWQtOTVjMy01NzFlMGRkZThhYmEiLCJpZCI6Mzc1MjUsImlhdCI6MTYwNTE2MjMxNn0.NJ33oqQu8VeX6Yh55y4TiOCtFe5Cxfk6UbddVUorHWo';


class Init_comp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            time_parameter: {},
            time_option: {},
            viewerArray: [],
            imageryLayers: ""
        };

        this.custom_render_loop = this.custom_render_loop.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.rend_flag = 0


    }

    async handleChange(event) {
        const type = event.target.id
        const val = event.target.value
        let param_dic_tmp = this.state.time_parameter
        param_dic_tmp[type] = val
        const { param_dic, OptionDic } = await check_datetime_from_input(s3, param_dic_tmp)

        console.log("handle", param_dic)
        console.log("tmp", param_dic_tmp)

        this.setState({
            time_parameter: param_dic,
            time_option: OptionDic
        })

    }


    componentDidUpdate() {

        setViewer(this.state.imageryLayers, this.state.viewerArray, this.state.time_parameter, _propertyArray, 0)

        for (let i = 0; i < viewerIdArray.length; i++) {
            this.state.viewerArray[i].scene.requestRender();
        };

        this.rend_flag = 0
        this.custom_render_loop()

    }


    custom_render_loop() {
        for (let i = 0; i < viewerIdArray.length; i++) {
            this.state.viewerArray[i].scene.requestRender();
        }

        if (this.rend_flag == 50) {
            return
        } else {
            this.rend_flag = this.rend_flag + 1
            window.requestAnimationFrame(this.custom_render_loop);
        }
    }



    async componentDidMount() {
        const { param_dic, OptionDic } = await init_datetime(s3)
        let viewerArray = []
        viewerIdArray.forEach(viewerId => {

            const viewer = new Cesium.Viewer(viewerId, {
                requestRenderMode: true,
                maximumRenderTimeChange: 10,
                useDefaultRenderLoop: true,
                animation: false,
                baseLayerPicker: false,
                fullscreenButton: false,
                geocoder: false,
                homeButton: false,
                infoBox: false,
                sceneModePicker: false,
                selectionIndicator: false,
                timeline: false,
                navigationHelpButton: false,
                skyBox: false,
                skyAtmosphere: false,
            })
            viewerArray.push(viewer);
        })

        viewerArray[0].camera.changed.addEventListener(() => {
            for (let i = 1; i < viewerIdArray.length; i++) {
                viewerArray[i].camera.position = viewerArray[0].camera.position;
                viewerArray[i].camera.direction = viewerArray[0].camera.direction;
                viewerArray[i].camera.up = viewerArray[0].camera.up;
                viewerArray[i].camera.right = viewerArray[0].camera.right;
            };
        });
        for (let i = 1; i < viewerIdArray.length; i++) {
            viewerArray[i].camera.changed.addEventListener(() => {
                viewerArray[0].camera.position = viewerArray[i].camera.position;
                viewerArray[0].camera.direction = viewerArray[i].camera.direction;
                viewerArray[0].camera.up = viewerArray[i].camera.up;
                viewerArray[0].camera.right = viewerArray[i].camera.right;
            });
        };

        const imageryLayers = viewerArray[0].imageryLayers
        this.setState({
            time_parameter: param_dic,
            time_option: OptionDic,
            viewerArray: viewerArray,
            imageryLayers: imageryLayers
        });

    }


    render() {

        const year_list = create_option(this.state.time_option["year"])
        const month_list = create_option(this.state.time_option["monthday"])
        const hour_list = create_option(this.state.time_option["hourminute"])

        let view_name_array = []

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 3; j++) {
                const view_name = "viewer" + String(i + 1) + String(j + 1)
                view_name_array.push(view_name)
            }
        }



        return (
            <div>
                <div>
                    <Time_select_pulldown name="year" val={this.state.time_parameter["year"]} option={year_list} onChange={this.handleChange} />
                    <Time_select_pulldown name="monthday" val={this.state.time_parameter["monthday"]} option={month_list} onChange={this.handleChange} />
                    <Time_select_pulldown name="hourminute" val={this.state.time_parameter["hourminute"]} option={hour_list} onChange={this.handleChange} />



                </div>
                <br></br>

                <table>
                    <tbody>
                        <tr>
                            {[...Array(3)].map((_, i) => {
                                return (
                                    <td>
                                        <Range_select name={i} val = {_com.aipMinValueArray[i]}/>
                                        <div className="v" id={view_name_array[i]}></div>
                                    </td>

                                )
                            })}
                        </tr>
                        <tr>
                            {[...Array(3)].map((_, i) => {
                                return (
                                    <td>
                                        <Range_select name={i + 3} val = {_com.aipMinValueArray[i]}/><br />
                                        <div className="v" id={view_name_array[i + 3]}></div>
                                    </td>
                                )
                            })}
                        </tr>

                    </tbody>
                </table>

                <div style={{ visibility: "hidden" }} id="controleViewer"></div>
                <div style={{ visibility: "hidden" }} id="c"></div>

            </div>
        );
    }
}


const domContainer = document.getElementById('app');
const figure = <Init_comp key="root" />
ReactDOM.render(figure, domContainer);