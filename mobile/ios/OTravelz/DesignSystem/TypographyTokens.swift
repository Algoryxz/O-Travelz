import SwiftUI

/// Editorial Publication Typography Hierarchy
enum TypographyTokens {
    static let headlineLarge = Font.system(size: 32, weight: .bold, design: .default)
    static let titleLarge = Font.system(size: 22, weight: .semibold, design: .default)
    static let titleMedium = Font.system(size: 16, weight: .medium, design: .default)
    static let bodyLarge = Font.system(size: 16, weight: .regular, design: .default)
    static let bodyMedium = Font.system(size: 14, weight: .regular, design: .default)
    static let labelLarge = Font.system(size: 14, weight: .medium, design: .default)
    static let labelSmall = Font.system(size: 11, weight: .medium, design: .default)
}