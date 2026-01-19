import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

export function HealthReportUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [reportDate, setReportDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    confidence?: number;
    biologicalAge?: number;
  } | null>(null);

  const utils = trpc.useUtils();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // 验证文件类型
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        alert("请上传PDF或图片文件（JPG/PNG）");
        return;
      }
      // 验证文件大小（最大10MB）
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert("文件大小不能超过10MB");
        return;
      }
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const uploadMutation = trpc.health.uploadHealthReport.useMutation({
    onSuccess: (data) => {
      setUploading(false);
      setUploadResult({
        success: true,
        message: "体检报告上传成功！已自动提取生物标志物数据。",
        confidence: data.parseResult.confidence,
        biologicalAge: data.parseResult.biologicalAge,
      });
      setFile(null);
      // 刷新相关数据
      utils.health.getLatestBiomarker.invalidate();
      utils.health.getLifespanPrediction.invalidate();
      utils.health.getHealthReports.invalidate();
    },
    onError: (error) => {
      setUploading(false);
      setUploadResult({
        success: false,
        message: error.message || "上传失败，请重试",
      });
    },
  });

  const handleUpload = async () => {
    if (!file) {
      alert("请先选择文件");
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      // 将文件转换为base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        // 移除data URL前缀
        const base64Content = base64Data.split(",")[1];

        await uploadMutation.mutateAsync({
          file: base64Content,
          fileName: file.name,
          mimeType: file.type,
          reportDate,
        });
      };
      reader.onerror = () => {
        setUploading(false);
        setUploadResult({
          success: false,
          message: "读取文件失败",
        });
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      setUploading(false);
      setUploadResult({
        success: false,
        message: error.message || "上传失败",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          上传体检报告
        </CardTitle>
        <CardDescription>
          上传您的体检报告（PDF或图片），AI将自动提取生物标志物数据
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 报告日期 */}
        <div className="space-y-2">
          <Label htmlFor="reportDate">报告日期</Label>
          <Input
            id="reportDate"
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            disabled={uploading}
          />
        </div>

        {/* 文件上传 */}
        <div className="space-y-2">
          <Label htmlFor="file">选择文件（PDF或图片，最大10MB）</Label>
          <div className="flex items-center gap-4">
            <Input
              id="file"
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/jpg"
              onChange={handleFileChange}
              disabled={uploading}
              className="flex-1"
            />
            {file && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FileText className="w-4 h-4" />
                {file.name}
              </div>
            )}
          </div>
        </div>

        {/* 上传按钮 */}
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              上传中...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              上传并解析
            </>
          )}
        </Button>

        {/* 上传进度 */}
        {uploading && (
          <div className="space-y-2">
            <Progress value={undefined} className="w-full" />
            <p className="text-sm text-slate-500 text-center">
              正在上传并解析报告，这可能需要几分钟...
            </p>
          </div>
        )}

        {/* 上传结果 */}
        {uploadResult && (
          <Alert
            variant={uploadResult.success ? "default" : "destructive"}
            className={
              uploadResult.success
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }
          >
            {uploadResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <AlertTitle>
              {uploadResult.success ? "上传成功" : "上传失败"}
            </AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{uploadResult.message}</p>
              {uploadResult.success && uploadResult.confidence !== undefined && (
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    <strong>解析置信度:</strong> {uploadResult.confidence}%
                  </p>
                  {uploadResult.biologicalAge !== undefined && (
                    <p>
                      <strong>生物年龄:</strong> {uploadResult.biologicalAge.toFixed(1)} 岁
                    </p>
                  )}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* 说明 */}
        <div className="text-sm text-slate-500 space-y-1">
          <p className="font-medium">支持的格式：</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>PDF文件（.pdf）</li>
            <li>图片文件（.jpg, .jpeg, .png）</li>
          </ul>
          <p className="font-medium mt-2">提取的指标：</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>血糖、胆固醇、血压</li>
            <li>肌酐、白蛋白</li>
            <li>血细胞指标等</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}