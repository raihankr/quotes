export default interface IResponse {
  status: "success" | "error";
  data: Record<string, any>;
  message?: string;
}
