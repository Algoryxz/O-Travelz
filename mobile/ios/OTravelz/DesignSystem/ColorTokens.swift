import SwiftUI
import UIKit

/// Modern Odisha Cultural Atlas Palette (Frozen in Wave M4)
enum ColorTokens {
    static let sandstoneLight = Color(red: 0.961, green: 0.949, blue: 0.922) // #F5F2EB
    static let basaltDark = Color(red: 0.071, green: 0.063, blue: 0.055)    // #12100E

    static var canvas: Color {
        Color(uiColor: UIColor { traitCollection in
            traitCollection.userInterfaceStyle == .dark ?
                UIColor(red: 0.071, green: 0.063, blue: 0.055, alpha: 1.0) :
                UIColor(red: 0.961, green: 0.949, blue: 0.922, alpha: 1.0)
        })
    }

    static var textPrimary: Color {
        Color(uiColor: UIColor { traitCollection in
            traitCollection.userInterfaceStyle == .dark ?
                UIColor(red: 0.980, green: 0.973, blue: 0.961, alpha: 1.0) :
                UIColor(red: 0.102, green: 0.086, blue: 0.071, alpha: 1.0)
        })
    }

    static var textSecondary: Color {
        Color(uiColor: UIColor { traitCollection in
            traitCollection.userInterfaceStyle == .dark ?
                UIColor(red: 0.690, green: 0.659, blue: 0.624, alpha: 1.0) :
                UIColor(red: 0.361, green: 0.333, blue: 0.302, alpha: 1.0)
        })
    }

    static let terracotta = Color(red: 0.784, green: 0.353, blue: 0.196)     // #C85A32
    static let chilika = Color(red: 0.169, green: 0.420, blue: 0.533)        // #2B6B88
    static let forest = Color(red: 0.176, green: 0.353, blue: 0.247)         // #2D5A3F

    // Semantic aliases
    static let chilikaBlue = chilika
    static let forestGreen = forest

    static var surface: Color {
        Color(uiColor: UIColor { traitCollection in
            traitCollection.userInterfaceStyle == .dark ?
                UIColor(red: 0.12, green: 0.11, blue: 0.10, alpha: 1.0) :
                UIColor(red: 1.0, green: 1.0, blue: 1.0, alpha: 1.0)
        })
    }

    static var surfaceVariant: Color {
        textSecondary.opacity(0.15)
    }

    // Truth Colors
    static let truthVerified = Color(red: 0.180, green: 0.490, blue: 0.196)  // #2E7D32
    static let truthScheduled = Color(red: 0.082, green: 0.396, blue: 0.753) // #1565C0
    static let truthCandidate = Color(red: 0.902, green: 0.318, blue: 0.0)   // #E65100
    static let truthUnavailable = Color(red: 0.380, green: 0.380, blue: 0.380) // #616161
}