import 'dart:convert';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

class HttpUtil {

  static Future<http.Response> sendPost(String url, body) async {
    return sendAuthPost('', url, body);
  }

  static Future<http.Response> sendAuthPost(String jwt, String url, Map<String, dynamic> body) async {
    return _fetch('POST', jwt, url, body);
  }

  static Future<http.Response> sendGet(String url) async {
    return sendAuthGet('', url);
  }

  static Future<http.Response> sendAuthGet(String jwt, String url) async {
    return _fetch('GET', jwt, url, {});
  }

  static Future<http.Response> sendDelete(String url, Map<String, dynamic> body) async {
    return sendAuthDelete('', url, body);
  }

  static Future<http.Response> sendAuthDelete(String jwt, String url, Map<String, dynamic> body) async {
    return _fetch('DELETE', jwt, url, body);
  }

  static Future<http.Response> sendPatch(String url, Map<String, dynamic> body) async {
    return sendAuthPatch('', url, body);
  }

  static Future<http.Response> sendAuthPatch(String jwt, String url, Map<String, dynamic> body) async {
    return _fetch('PATCH', jwt, url, body);
  }

  static Future<http.Response> _fetch(String type, String jwt, String url, Map<String, dynamic> body) async {
    var headers = {
      'Content-Type': 'application/json',
      'Origin': dotenv.env['ALLOW_ORIGIN']!
    };
    final jsonBody = jsonEncode(body);

    if(jwt != '') {
      headers['Authorization'] = 'Bearer $jwt';
    }

    final uri = Uri.parse(url);

    switch(type) {
      case "POST":
        return await http.post(uri, headers: headers, body: jsonBody);
      case "GET":
        return await http.get(uri, headers: headers);
      case "DELETE":
        return await http.delete(uri, headers: headers, body: jsonBody);
      case "PATCH":
        return await http.patch(uri, headers: headers, body: jsonBody);
      default:
        return http.Response("{}", 500);
    }
  }

}