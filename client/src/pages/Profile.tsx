import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { User, Calendar, Heart, Save, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HealthReportUpload } from "@/components/HealthReportUpload";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    user?.dateOfBirth ? new Date(user.dateOfBirth as any).toISOString().split("T")[0] : ""
  );
  const [gender, setGender] = useState<"male" | "female" | "other" | "">(
    (user?.gender as any) || ""
  );
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const { data: healthReports, isLoading: reportsLoading } = trpc.health.getHealthReports.useQuery();
  const { data: latestBiomarker } = trpc.health.getLatestBiomarker.useQuery();

  const updateProfileMutation = trpc.system.updateProfile.useMutation({
    onSuccess: () => {
      setSaving(false);
      setSaveResult({
        success: true,
        message: "个人资料已更新",
      });
    },
    onError: (error) => {
      setSaving(false);
      setSaveResult({
        success: false,
        message: error.message || "更新失败",
      });
    },
  });

  const handleSave = async () => {
    setSaving(true);
    setSaveResult(null);

    try {
      await updateProfileMutation.mutateAsync({
        name: name || undefined,
        email: email || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
      });
    } catch (error) {
      // 错误已在mutation中处理
    }
  };

  // 计算年龄
  const calculateAge = () => {
    if (!dateOfBirth) return null;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="flex items-center gap-3">
          <User className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">个人档案</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                基本信息
              </CardTitle>
              <CardDescription>更新您的个人资料信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入您的姓名"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入您的邮箱"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  出生日期
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
                {dateOfBirth && (
                  <p className="text-sm text-slate-500">
                    年龄: {calculateAge()} 岁
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  性别
                </Label>
                <Select value={gender} onValueChange={(value: any) => setGender(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择性别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">男</SelectItem>
                    <SelectItem value="female">女</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    保存更改
                  </>
                )}
              </Button>

              {saveResult && (
                <Alert
                  variant={saveResult.success ? "default" : "destructive"}
                  className={
                    saveResult.success
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }
                >
                  <AlertDescription>{saveResult.message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* 健康数据摘要 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                健康数据摘要
              </CardTitle>
              <CardDescription>您的最新健康指标</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestBiomarker ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">生物年龄</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {latestBiomarker.biologicalAge
                          ? Number(latestBiomarker.biologicalAge).toFixed(1)
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">准确度</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {latestBiomarker.biologicalAgeAccuracy || "-"}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">血糖:</span>
                      <span className="font-medium">
                        {latestBiomarker.glucose ? `${latestBiomarker.glucose} mg/dL` : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">收缩压:</span>
                      <span className="font-medium">
                        {latestBiomarker.systolicBP
                          ? `${latestBiomarker.systolicBP} mmHg`
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">肌酐:</span>
                      <span className="font-medium">
                        {latestBiomarker.creatinine
                          ? `${latestBiomarker.creatinine} mg/dL`
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">
                  暂无健康数据，请上传体检报告
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 上传体检报告 */}
        <HealthReportUpload />

        {/* 体检报告历史 */}
        <Card>
          <CardHeader>
            <CardTitle>体检报告历史</CardTitle>
            <CardDescription>查看您上传的体检报告列表</CardDescription>
          </CardHeader>
          <CardContent>
            {reportsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : healthReports && healthReports.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>报告日期</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {healthReports.map((report: any) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        {new Date(report.reportDate).toLocaleDateString("zh-CN")}
                      </TableCell>
                      <TableCell>
                        {report.reportType === "uploaded" ? "上传" : "手动输入"}
                      </TableCell>
                      <TableCell>
                        {report.extractedAt ? (
                          <span className="text-green-600">已解析</span>
                        ) : (
                          <span className="text-orange-600">待解析</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {report.sourceUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(report.sourceUrl, "_blank")}
                          >
                            查看
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-slate-500 text-center py-8">
                暂无体检报告记录
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}