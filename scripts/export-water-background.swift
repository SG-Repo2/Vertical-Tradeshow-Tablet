import AVFoundation
import Foundation

enum ExportError: Error, CustomStringConvertible {
  case usage
  case missingPreset(String)
  case missingExporter
  case missingMP4Support([String])
  case failed(String)

  var description: String {
    switch self {
    case .usage:
      return "Usage: swift export-water-background.swift <input> <output> <seconds>"
    case let .missingPreset(preset):
      return "The source video does not support export preset \(preset)."
    case .missingExporter:
      return "Could not create AVAssetExportSession."
    case let .missingMP4Support(types):
      return "MP4 export is not supported for this source. Supported types: \(types.joined(separator: ", "))"
    case let .failed(message):
      return message
    }
  }
}

func main() throws {
  guard CommandLine.arguments.count >= 4 else {
    throw ExportError.usage
  }

  let inputURL = URL(fileURLWithPath: CommandLine.arguments[1])
  let outputURL = URL(fileURLWithPath: CommandLine.arguments[2])
  let seconds = Double(CommandLine.arguments[3]) ?? 16
  let asset = AVURLAsset(url: inputURL)
  let preset = AVAssetExportPreset1280x720

  guard AVAssetExportSession.exportPresets(compatibleWith: asset).contains(preset) else {
    throw ExportError.missingPreset(preset)
  }

  guard let exporter = AVAssetExportSession(asset: asset, presetName: preset) else {
    throw ExportError.missingExporter
  }

  let supportedTypes = exporter.supportedFileTypes
  guard supportedTypes.contains(.mp4) else {
    throw ExportError.missingMP4Support(supportedTypes.map(\.rawValue))
  }

  try? FileManager.default.removeItem(at: outputURL)
  exporter.outputURL = outputURL
  exporter.outputFileType = .mp4
  exporter.shouldOptimizeForNetworkUse = true
  exporter.timeRange = CMTimeRange(
    start: .zero,
    duration: CMTime(seconds: seconds, preferredTimescale: 600)
  )

  let semaphore = DispatchSemaphore(value: 0)
  exporter.exportAsynchronously {
    semaphore.signal()
  }
  semaphore.wait()

  if exporter.status != .completed {
    let message = exporter.error?.localizedDescription ?? "Unknown export failure."
    throw ExportError.failed(message)
  }

  let attributes = try FileManager.default.attributesOfItem(atPath: outputURL.path)
  let size = attributes[.size] as? NSNumber
  print("Exported \(outputURL.path) (\(size?.intValue ?? 0) bytes)")
}

do {
  try main()
} catch {
  fputs("\(error)\n", stderr)
  exit(1)
}
