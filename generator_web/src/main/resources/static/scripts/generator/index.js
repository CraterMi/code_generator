var reloadConnectionUrl = function(){
	$.post("/generator/connection/database/warpConnectionUrl",$("#generatorForm").serialize(),function(data){
		$("input[name='database.connectionUrl']").val(data);
		$("p.connectionUrl").text(data);
	});
};
//重新加载数据库select
var reloadDatabases = function(){
	if($("input[name='database.url']").val() && $("input[name='database.port']").val()){
		$.post("/generator/connection/database/findDatabaseNameList",$("#generatorForm").serialize(),function(datas){
			var select = $("select[name='database.databaseName']");
			select.html("");
			if(!datas || datas.length == 0){
				select.append("<option>未查询到数据库信息</option>");
				return;
			}
			for(var i = 0 , length = datas.length ; i < length ; i ++){
				var data = datas[i];
				select.append("<option value='" + data.database + "'>" + data.databaseName + "</option>");
			}
			
			$("select[name='database.databaseName']").trigger("change");
			
			reloadConnectionUrl();
		});
	}
};


$(document).ready(function(){
	//重新加载生成数据库连接参数
	var reloadParameter = function(connectionId){
		//加载数据库页签
		$("div#database").load("/generator/connection/index/database?" + (connectionId ? "connection.id=" + connectionId : ""));
		//加载ssh页签
		$("div#ssh").load("/generator/connection/index/ssh?" + (connectionId ? "connection.id=" + connectionId : ""));
		//加载生成数据的参数
		$("div#generateParameter").load("/generator/connection/index/generateParameter?" + (connectionId ? "connection.id=" + connectionId : ""));
	};
	//重新加载保存的链接
	var reloadConnections = function(callback){
		//加载所有的链接
		$.get("/generator/connection/findConnections",function(datas){
			var select = $("select[name='connectionId']");
			select.html("");
			for(var i = 0 , length = datas.length ; i < length ; i ++){
				var data = datas[i];
				select.append("<option value='" + data.id + "'>" + data.connectionName + "</option>");
			}
			
			if(callback && $.isFunction(callback)){
				callback();
			}
		});
	};
	//获取所有选择的表名
	var getSelectTableNames = function(){
		var selectTables = $('#selectTableNameTable').bootstrapTable('getSelections');
		if(!selectTables || selectTables.length == 0){
			return null;
		}
		var tableNames = "";
		for(var i = 0 , length = selectTables.length ; i < length ; i ++){
			if(tableNames.length > 0){
				tableNames = tableNames + ",";
			}
			tableNames = tableNames + selectTables[i].name;
		}
		return tableNames;
	};
	//获取所有选择的插件名称
	var getPluginNames = function(){
		var pluginTables = $('#pluginTable').bootstrapTable('getSelections');
		if(!pluginTables || pluginTables.length == 0){
			return null;
		}
		
		var pluginNames = "";
		for(var i = 0 , length = pluginTables.length ; i < length ; i ++){
			if(pluginNames.length > 0){
				pluginNames = pluginNames + ",";
			}
			pluginNames = pluginNames + pluginTables[i].groupName + "." + pluginTables[i].name;
		}
		return pluginNames;
	};
	//校验
	var valid = function(){
		
		/******** 数据库校验项 *********/
		//数据库地址不能为空
		if(!$("input[name='database.url']").val()){
			$(".success").hide();
			$(".alertMsg").text("数据库地址不能为空");
			$(".error,.alert-warning").show();
			return false;
		}
		//数据库端口号不能为空
		var port = $("input[name='database.port']").val();
		if(!port){
			$(".success").hide();
			$(".alertMsg").text("数据库端口号不能为空");
			$(".error,.alert-warning").show();
			return false;
		}
		//数据库端口号必须为数字
		var reg = new RegExp(regexp.constants.integer);
		if(!reg.test(port)){
			$(".success").hide();
			$(".alertMsg").text("数据库端口号必须为数字");
			$(".error,.alert-warning").show();
			return false;
		}
		//数据库端口号必须在1到65535之间
		port = parseInt(port);
		if(port < 1 || port > 65535){
			$(".success").hide();
			$(".alertMsg").text("数据库端口号必须在1到65535之间");
			$(".error,.alert-warning").show();
			return false;
		}
		
		//数据库名不能为空
		if(!$("select[name='database.databaseName']").val()){
			$(".success").hide();
			$(".alertMsg").text("数据库名不能为空");
			$(".error,.alert-warning").show();
			return false;
		}
		
		/**    ssh校验     **/
		var sshHost = $("input[name='ssh.host']").val();
		var sshPort = $("input[name='ssh.port']").val();
		var sshUsername = $("input[name='ssh.username']").val();
		var sshPassword = $("input[name='ssh.password']").val();
		if(sshHost || sshPort || sshUsername || sshPassword){
			//SSH地址不能为空
			if(!sshHost){
				$(".success").hide();
				$(".alertMsg").text("SSH地址不能为空");
				$(".error,.alert-warning").show();
				return false;
			}
			//SSH端口号不能为空
			if(!sshPort){
				$(".success").hide();
				$(".alertMsg").text("SSH端口号不能为空");
				$(".error,.alert-warning").show();
				return false;
			}
			//SSH端口号必须为数字
			if(!reg.test(sshPort)){
				$(".success").hide();
				$(".alertMsg").text("SSH端口号必须为数字");
				$(".error,.alert-warning").show();
				return false;
			}
			//SSH端口号必须在1到65535之间
			sshPort = parseInt(sshPort);
			if(sshPort < 1 || sshPort > 65535){
				$(".success").hide();
				$(".alertMsg").text("SSH端口号必须在1到65535之间");
				$(".error,.alert-warning").show();
				return false;
			}
			//SSH用户名不能为空
			if(!sshUsername){
				$(".success").hide();
				$(".alertMsg").text("SSH用户名不能为空");
				$(".error,.alert-warning").show();
				return false;
			}
			//SSH地址不能为空
			if(!sshPassword){
				$(".success").hide();
				$(".alertMsg").text("SSH密码不能为空");
				$(".error,.alert-warning").show();
				return false;
			}
		}

		//获取选择的插件列表
		var pluginNames = getPluginNames();
		if(null == pluginNames){
			$(".success").hide();
			$(".alertMsg").text("请选择生成代码插件");
			$(".error,.alert-warning").show();
			return false;
		}

		//如果选中了链接且正在加载中则显示加载中
		if($("input[name='lodingTables']").val() == 1){
			$(".success").hide();
			$(".alertMsg").text("正在加载要生成代码的表列表，请稍后重试");
			$(".error,.alert-warning").show();
			return false;
		}

		//获取选择的表名列表
		var selectTableNames = getSelectTableNames();
		if(null == selectTableNames){
			$(".success").hide();
			$(".alertMsg").text("请选择要生成代码的表");
			$(".error,.alert-warning").show();
			return false;
		}
		
		return true;
	};
	
	//重新选择保存的链接
	$("select[name='connectionId']").change(function(){
		$("input[name='lodingTables']").val($("select[name='connectionId']").val() ? 1 : 0);

		var value = $(this).val();
		reloadParameter(value);
		$("input[name='connection.id']").val(value);
		var connectionName = $(this).find("option[value='"+value+"']").text();
		$("input[name='connection.connectionName']").val(connectionName);

		//删除value为空的option
		$(this).find("option").each(function () {
			var option = $(this);
			if(!option.attr("value")){
				option.remove();
			}
		});
	});
	
	$("select[name='connectionId']").trigger("change");
	
	//测试链接
	$("button.validConnection").click(function(){
		if(valid()){
			$.post("/generator/connection/validConnection",$("#generatorForm").serialize(),function(data){
				if(data && $.isPlainObject(data) && data.errorMessage){
					$(".success").hide();
					$(".alertMsg").text(data.errorMessage);
					$(".error,.alert-warning").show();
				}else{
					$(".error").hide();
					$(".successMsg").text("连接成功");
					$(".success,.alert-success").show();
				}
			});
		}
	});
	//生成代码
	$("button.generateCode").click(function(){
		if(valid()){
			//获取选择的插件列表
			var pluginNames = getPluginNames();
			
			//获取选择的表名列表
			var selectTableNames = getSelectTableNames();
			
			var params = $("#generatorForm").serializeObject();
			params["generateParameter.pluginNames"] = pluginNames;
			params["generateParameter.tableNames"] = selectTableNames;
			
			$.fileDownload("/generator/generate", {
				data: params,
				httpMethod: 'POST',
				prepareCallback: function(url){
					console.log("开始生成代码");
				},
				successCallback: function(url){
					$(".successMsg").text("生成代码成功");
					$(".success").show();
					$(".error,.alert-warning").hide();
				},
				failCallback: function(html, url, error){
					$(".success").hide();
					$(".alertMsg").text("生成代码失败" + (error ? ":" + error.message : ""));
					$(".error,.alert-warning").show();
				},
			});
		}
	});
	//新建链接
	$("button.newConnection").click(function(){
		if($("input[name='lodingTables']").val() == 1){
			$(".success").hide();
			$(".alertMsg").text("正在读取生成代码表列表，请稍后重试");
			$(".error,.alert-warning").show();
			return;
		}

		$("input[name='connection.id'],input[name='connection.connectionName']").val("");
		
		//重新加载链接
		reloadParameter();

		$(".success,.error").hide();

		if($("select[name='connectionId'] option[value='']").length == 0){
			$("select[name='connectionId']").append("<option value=''></option>");
		}

		$("select[name='connectionId']").val("");

		$('#tab a:first').tab('show');
	});
	//克隆链接
	$("button.cloneConnection").click(function(){
		var connectionId = $("input[name='connection.id']").val();
		if(!connectionId){
			$(".success").hide();
			$(".alertMsg").text("当前链接未保存，请先保存当前链接");
			$(".error,.alert-warning").show();
			return;
		}
		//重新加载链接
		reloadParameter(connectionId);
		
		$("input[name='connection.id'],input[name='connection.connectionName']").val("");

		$(".success,.error").hide();

		if($("select[name='connectionId'] option[value='']").length == 0){
			$("select[name='connectionId']").append("<option value=''></option>");
		}

		$("select[name='connectionId']").val("");

		$('#tab a:first').tab('show');
	});
	//保存链接
	$("button.saveConnection").click(function(){
		$(".success").hide();
		if(valid()){
			//获取选择的插件列表
			var pluginNames = getPluginNames();
			
			//获取选择的表名列表
			var selectTableNames = getSelectTableNames();
			
			var connectionId = $("input[name='connection.id']").val();
			
			var params = $("#generatorForm").serializeObject();
			params["generateParameter.pluginNames"] = pluginNames;
			params["generateParameter.tableNames"] = selectTableNames;
			delete params.btSelectItem;
			
			//如果链接id不存在则认为是新增
			if(!connectionId){
				//弹出新增modal
				$.modal({
					title: "新增链接",
					callback: function(modal,flag){
						if(flag){
							var connectionName = modal.find("input[name='connection.connectionName']").val();
							if(!connectionName){
								modal.find("input[name='connection.connectionName']").parent().next().text("链接名称不能为空");
								return false;
							}
							
							params._method = "POST";
							delete params["database.id"];
							delete params["ssh.id"];
							delete params["generateParameter.id"];
							
							var connectionName = modal.find("input[name='connection.connectionName']").val();
							$("input[name='connection.connectionName']").val(connectionName);
							params["connection.connectionName"] = connectionName;
							
							var f = true;
							$.ajax({
								type: "post", 
							    url: "/generator/connection", 
							    data: params,
							    cache:false, 
							    async:false, 
							    success: function(data){ 
							    	if(data && $.isPlainObject(data) && data.errorMessage){
										$.alert("新增链接失败：" + data.errorMessage);
										f = false;
									}else{
										//重新加载保存的链接
										reloadConnections(function(){
											//选中保存的链接
											$("select[name='connectionId']").val(data);
											//重新加载所保存的链接
											$("select[name='connectionId']").trigger("change");
										});
										
										$.alert("新增链接成功");
									}
							    } 
							});
							
							return f;
						}
					},
					body: "	<div class='form-group' style='margin-bottom: 0;height: 34px;'>"
						+" 		<label class='col-sm-2 control-label' style='height: 34px;line-height: 34px;'>链接名称：</label>"
		                +"		<div class='col-sm-7'>"
		                +"			<input name='connection.connectionName' class='form-control' maxlength='255' placeholder='链接名称不能为空'/>"
		                +"		</div>"
		                +"		<span style='color:red;height: 34px;line-height: 34px;'></span>"
		                +"	</div>"
				});
			}else{
				params._method = "PUT";
				
				$.post("/generator/connection", params, function(data){
					if(data && $.isPlainObject(data) && data.errorMessage){
						$(".success").hide();
						$(".alertMsg").text(data.errorMessage);
						$(".error,.alert-warning").show();
					}else{
						$(".successMsg").text("更新链接成功");
						$(".success").show();
						$(".error,.alert-warning").hide();
					}
				});
			}
			
		}
	});
	
	//删除链接
	$("button.deleteConnection").click(function(){
		$.confirm("确定要删除该链接？",function(flag){
			if(flag){
				var id = $("input[name='connection.id']").val();
				if(!id){
					$(".success").hide();
					$(".alertMsg").text("未获取到链接，请确认当前是否是新增或克隆且尚未保存");
					$(".error,.alert-warning").show();
					return;
				}
				$.post("/generator/connection/" + id, {"_method" : "DELETE" , "_csrf" : $("meta[name='_csrf']").attr("content")}, function(data){
					if(data && $.isPlainObject(data) && data.errorMessage){
						$(".success").hide();
						$(".alertMsg").text(data.errorMessage);
						$(".error,.alert-warning").show();
					}else{
						$(".successMsg").text("删除成功");
						$(".success,.alert-success").show();
						$(".error").hide();
						
						//重新加载链接
						reloadConnections(function(){
							var id = $("select[name='connectionId'] option:eq(0)").attr("value");
							//选中第一个链接
							$("select[name='connectionId']").val(id);
							//重新加载所保存的链接
							$("select[name='connectionId']").trigger("change");
						});
						
					}
				});
			}
		});
	});

	$("div.error a.close").click(function () {
		$("div.error").hide();
	});
	$("div.success a.close").click(function () {
		$("div.success").hide();
	});

});
